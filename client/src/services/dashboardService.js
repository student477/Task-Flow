import api from './api';

export const dashboardService = {
  // Aggregate metrics across user workspace
  getWorkspaceStats: async () => {
    return await api.get('/dashboard/stats');
  },

  // Detailed analytics for a specific project
  getProjectAnalytics: async (projectId) => {
    return await api.get(`/projects/${projectId}/analytics`);
  },

  // Project activity audit stream
  getProjectActivity: async (projectId) => {
    return await api.get(`/projects/${projectId}/activity`);
  }
};
