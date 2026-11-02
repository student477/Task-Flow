import api from './api';

export const taskService = {
  // Get all tasks for a project with optional filters
  getTasksByProject: async (projectId, params = {}) => {
    return await api.get(`/projects/${projectId}/tasks`, { params });
  },

  // Create new task in a project
  createTask: async (projectId, taskData) => {
    return await api.post(`/projects/${projectId}/tasks`, taskData);
  },

  // Get single task by ID
  getTaskById: async (taskId) => {
    return await api.get(`/tasks/${taskId}`);
  },

  // Update task details
  updateTask: async (taskId, taskData) => {
    return await api.put(`/tasks/${taskId}`, taskData);
  },

  // Update task status and column order (Kanban moves)
  updateTaskStatus: async (taskId, status, orderIndex) => {
    return await api.patch(`/tasks/${taskId}/status`, { status, orderIndex });
  },

  // Delete task
  deleteTask: async (taskId) => {
    return await api.delete(`/tasks/${taskId}`);
  },

  // Add checklist subtask
  addSubtask: async (taskId, title) => {
    return await api.post(`/tasks/${taskId}/subtasks`, { title });
  },

  // Toggle checklist subtask
  toggleSubtask: async (taskId, subtaskId) => {
    return await api.patch(`/tasks/${taskId}/subtasks/${subtaskId}`);
  },

  // Delete checklist subtask
  deleteSubtask: async (taskId, subtaskId) => {
    return await api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`);
  }
};
