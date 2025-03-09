import axios from "axios";

// The API_BASE_URL should not include the /api suffix
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Global request limiting
const MAX_REQUESTS_PER_SECOND = 1;
const REQUEST_WINDOW_MS = 1000;
let requestsInWindow = 0;
let windowStartTime = Date.now();

// Simple request throttling
const throttleRequests = () => {
  const now = Date.now();

  // Reset window if it's expired
  if (now - windowStartTime > REQUEST_WINDOW_MS) {
    requestsInWindow = 0;
    windowStartTime = now;
  }

  // Check if we've exceeded our rate limit
  if (requestsInWindow >= MAX_REQUESTS_PER_SECOND) {
    const timeToWait = REQUEST_WINDOW_MS - (now - windowStartTime);
    console.log(`Throttling: Waiting ${timeToWait}ms before next request`);
    return timeToWait > 0 ? timeToWait : 0;
  }

  // Increment request count
  requestsInWindow++;
  return 0;
};

// Request queue implementation with global state
class RequestQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.retryDelay = 1000; // Start with 1 second
    this.isRateLimited = false;
    this.rateLimitResetTime = null;
    this.consecutiveErrors = 0;
  }

  async add(request) {
    return new Promise((resolve, reject) => {
      // Add request to queue
      this.queue.push({ request, resolve, reject });

      // Start processing if not already
      if (!this.processing) {
        this.process();
      }
    });
  }

  async process() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    // Check if we're rate limited
    if (this.isRateLimited && this.rateLimitResetTime) {
      const now = Date.now();
      if (now < this.rateLimitResetTime) {
        const waitTime = this.rateLimitResetTime - now;
        console.log(
          `Rate limited. Waiting ${waitTime / 1000}s before retrying...`
        );
        setTimeout(() => {
          this.isRateLimited = false;
          this.rateLimitResetTime = null;
          this.processing = false;
          this.process();
        }, waitTime);
        return;
      }

      this.isRateLimited = false;
      this.rateLimitResetTime = null;
    }

    // Check global throttling
    const throttleTime = throttleRequests();
    if (throttleTime > 0) {
      setTimeout(() => {
        this.processing = false;
        this.process();
      }, throttleTime);
      return;
    }

    // Get next request
    const { request, resolve, reject } = this.queue.shift();

    try {
      // Execute the request
      const response = await request();

      // Success - reset error count and retry delay
      this.consecutiveErrors = 0;
      this.retryDelay = 1000;

      // Resolve the promise
      resolve(response);
    } catch (error) {
      // Handle rate limiting
      if (error.response?.status === 429) {
        // Increase consecutive errors
        this.consecutiveErrors++;

        // Get retry-after from header or use exponential backoff
        const retryAfter = error.response.headers["retry-after"];
        const waitTime = retryAfter
          ? retryAfter * 1000
          : Math.min(
              this.retryDelay * Math.pow(2, this.consecutiveErrors - 1),
              60000
            ); // Cap at 1 minute

        console.log(
          `Rate limited (429). Waiting ${
            waitTime / 1000
          }s before processing next request...`
        );

        // Set rate limit state
        this.isRateLimited = true;
        this.rateLimitResetTime = Date.now() + waitTime;

        // Put the request back at the front of the queue
        this.queue.unshift({ request, resolve, reject });

        // Wait and then continue processing
        setTimeout(() => {
          this.processing = false;
          this.process();
        }, waitTime);
        return;
      }

      // Handle other errors
      console.error("API request error:", error.message);
      this.consecutiveErrors++;
      reject(error);
    } finally {
      // Small delay between requests even on success
      setTimeout(() => {
        this.processing = false;
        // Process next request if any
        if (this.queue.length > 0) {
          this.process();
        }
      }, 1000); // Always wait 1s between requests
    }
  }
}

const requestQueue = new RequestQueue();

// Create the axios instance with proper baseURL
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 second timeout
});

// Cache for GET requests
const cache = new Map();
const CACHE_TTL = 60000; // 1 minute

// Wrap axios methods to use the queue
const queuedApiClient = {
  get: (url, config = {}) => {
    // Check cache first if caching is enabled
    const cacheKey = `${url}${JSON.stringify(config)}`;
    if (!config.noCache) {
      const cachedData = cache.get(cacheKey);
      if (cachedData && cachedData.expiry > Date.now()) {
        console.log(`Using cached data for ${url}`);
        return Promise.resolve(cachedData.data);
      }
    }

    return requestQueue.add(() =>
      apiClient.get(url, config).then((response) => {
        // Cache the response if it's successful
        if (!config.noCache) {
          cache.set(cacheKey, {
            data: response,
            expiry: Date.now() + CACHE_TTL,
          });
        }
        return response;
      })
    );
  },
  post: (url, data, config) =>
    requestQueue.add(() => apiClient.post(url, data, config)),
  put: (url, data, config) =>
    requestQueue.add(() => apiClient.put(url, data, config)),
  delete: (url, config) =>
    requestQueue.add(() => apiClient.delete(url, config)),
  clearCache: () => cache.clear(),
};

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Handle unauthorized error
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    if (error.response) {
      // Log the error details
      console.error("API Error:", {
        status: error.response.status,
        url: error.config.url,
        method: error.config.method,
        headers: error.response?.headers,
      });
    }

    return Promise.reject(error);
  }
);

export default queuedApiClient;
