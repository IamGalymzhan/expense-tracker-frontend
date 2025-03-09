import apiClient from "./apiClient";

// Debug flag for detailed logging
const DEBUG = false;

// Map of image keys to their local paths (will be populated dynamically)
const imageMap = new Map();

// Attempt to import all achievement images dynamically
const importImage = (imageName) => {
  try {
    // Convert backend image path to just the filename without extension
    const fileName = imageName
      .replace(/^.*[\\\/]/, "")
      .replace(/\.[^/.]+$/, "");

    // Check if we've already loaded this image
    if (imageMap.has(fileName)) {
      return imageMap.get(fileName);
    }

    // Attempt to load from local assets
    // This is a dynamic import pattern for Vite
    const imagePath = `/src/assets/achievements/${fileName}.png`;

    // Store in map for future use
    imageMap.set(fileName, imagePath);

    return imagePath;
  } catch (error) {
    console.warn(`Could not load achievement image: ${imageName}`, error);
    return null;
  }
};

// Debounce function to prevent too many calls
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Keep a cached copy of the achievements
let cachedAchievements = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const transformAchievements = (achievements) => {
  if (DEBUG) console.log("Raw achievements data:", achievements);

  // Handle null or undefined achievements
  if (!achievements || !Array.isArray(achievements)) {
    console.error("Invalid achievements data:", achievements);
    return { financial: [], time: [] };
  }

  // Remove duplicates by title (keeping the first occurrence)
  const uniqueAchievements = achievements.reduce((acc, curr) => {
    if (!acc.find((a) => a.title === curr.title)) {
      acc.push(curr);
    }
    return acc;
  }, []);

  if (DEBUG) console.log("Unique achievements:", uniqueAchievements.length);

  // Split achievements into categories and transform the data structure
  const transformed = uniqueAchievements.reduce(
    (acc, achievement) => {
      // Default to financial category if icon is missing
      const category =
        !achievement.icon || achievement.icon === "🏆" ? "financial" : "time";

      // Get local image path instead of backend URL
      let imagePath = null;

      if (achievement.imagePath) {
        // Extract just the filename part without extension
        const fileName = achievement.imagePath
          .split("/")
          .pop()
          .replace(/\.[^/.]+$/, "");

        // Map to the matching local image
        imagePath = importImage(fileName);
      }

      // Fallback to requirement type for image if available
      if (
        !imagePath &&
        achievement.requirements &&
        achievement.requirements.type
      ) {
        const requirementType = achievement.requirements.type
          .toLowerCase()
          .replace(/_/g, "-");
        imagePath = importImage(requirementType);
      }

      const transformedAchievement = {
        id: achievement.id,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon || "🏆", // Default icon
        // Use local image path instead of backend URL
        imagePath: imagePath,
        unlocked: achievement.completed,
        progress: achievement.progress || 0,
        requirements: achievement.requirements || {},
        completedAt: achievement.completedAt,
      };

      acc[category].push(transformedAchievement);
      return acc;
    },
    { financial: [], time: [] }
  );

  return transformed;
};

export const achievementService = {
  getAchievements: async (forceRefresh = false) => {
    try {
      const now = Date.now();

      // Use cached data if available, not expired, and not forced to refresh
      if (
        cachedAchievements &&
        now - lastFetchTime < CACHE_TTL &&
        !forceRefresh
      ) {
        console.log("Using cached achievements data");
        return cachedAchievements;
      }

      console.log("Fetching achievements from API");
      const response = await apiClient.get("/achievements");

      if (!response || !response.achievements) {
        console.error("Invalid API response:", response);
        return { financial: [], time: [] };
      }

      // Transform and cache the data
      cachedAchievements = transformAchievements(response.achievements || []);
      lastFetchTime = now;

      return cachedAchievements;
    } catch (error) {
      console.error("Error fetching achievements:", error);

      // Return cached data if available, otherwise empty object
      return cachedAchievements || { financial: [], time: [] };
    }
  },

  getAchievement: async (id) => {
    return apiClient.get(`/achievements/${id}`);
  },

  getProgress: async (forceRefresh = false) => {
    // Add force refresh option to progress fetching
    if (forceRefresh) {
      apiClient.clearCache(); // Clear API cache
    }
    return apiClient.get("/achievements/progress");
  },

  // Clear the achievement cache
  clearCache: () => {
    console.log("Clearing achievements cache");
    cachedAchievements = null;
    lastFetchTime = 0;
    apiClient.clearCache();
  },

  // Method to refresh achievements after adding new records
  refreshAfterNewRecord: async () => {
    console.log("Refreshing achievements after new record");
    // Clear both achievement and progress cache
    achievementService.clearCache();
    // Force fetch new achievements
    return achievementService.getAchievements(true);
  },
};

export default achievementService;
