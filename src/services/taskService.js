import apiClient from "./apiClient";

// Store callback functions for task updates
const taskUpdateCallbacks = [];

// Function to register a callback when tasks change
export const registerTaskUpdateCallback = (callback) => {
  if (
    typeof callback === "function" &&
    !taskUpdateCallbacks.includes(callback)
  ) {
    taskUpdateCallbacks.push(callback);
    return true;
  }
  return false;
};

// Function to unregister a callback
export const unregisterTaskUpdateCallback = (callback) => {
  const index = taskUpdateCallbacks.indexOf(callback);
  if (index !== -1) {
    taskUpdateCallbacks.splice(index, 1);
    return true;
  }
  return false;
};

// Function to notify all registered components about task changes
const notifyTaskUpdate = () => {
  console.log(
    `Notifying ${taskUpdateCallbacks.length} listeners about task update`
  );
  taskUpdateCallbacks.forEach((callback) => {
    try {
      callback();
    } catch (error) {
      console.error("Error in task update callback:", error);
    }
  });
};

export const taskService = {
  getTasks: async (params = {}, forceRefresh = false) => {
    // If forceRefresh is true, clear the cache before fetching
    if (forceRefresh) {
      apiClient.clearCache();
    }
    return apiClient.get("/tasks", { params });
  },

  getTask: async (id) => {
    return apiClient.get(`/tasks/${id}`);
  },

  createTask: async (taskData) => {
    const response = await apiClient.post("/tasks", taskData);
    // Clear cache after creating a task
    apiClient.clearCache();
    // Notify listeners about the update
    notifyTaskUpdate();
    return response;
  },

  updateTask: async (id, taskData) => {
    const response = await apiClient.put(`/tasks/${id}`, taskData);
    // Clear cache after updating a task
    apiClient.clearCache();
    // Notify listeners about the update
    notifyTaskUpdate();
    return response;
  },

  deleteTask: async (id) => {
    const response = await apiClient.delete(`/tasks/${id}`);
    // Clear cache after deleting a task
    apiClient.clearCache();
    // Notify listeners about the update
    notifyTaskUpdate();
    return response;
  },

  // Time tracking functionality
  addTimeLog: async (taskId, timeSpent, date = new Date()) => {
    const response = await apiClient.post("/tasks/time-logs", {
      task_id: taskId,
      time_spent: timeSpent,
      date: date,
    });
    // Clear cache after adding time log as it might affect task statistics
    apiClient.clearCache();
    // Notify listeners about the update
    notifyTaskUpdate();
    return response;
  },

  getTimeStats: async (params = {}, forceRefresh = false) => {
    // If forceRefresh is true, clear the cache before fetching
    if (forceRefresh) {
      apiClient.clearCache();
    }
    return apiClient.get("/tasks/time-stats", { params });
  },

  // Explicitly refresh all task data
  refreshTasks: async () => {
    console.log("Refreshing all task data...");
    apiClient.clearCache();
    // Notify listeners about the update
    notifyTaskUpdate();
    return taskService.getTasks({}, true);
  },
};

export default taskService;
