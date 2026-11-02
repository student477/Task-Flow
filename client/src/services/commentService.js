import api from './api';

export const commentService = {
  // Get all comments for a task
  getComments: async (taskId) => {
    return await api.get(`/tasks/${taskId}/comments`);
  },

  // Post comment to task
  addComment: async (taskId, content) => {
    return await api.post(`/tasks/${taskId}/comments`, { content });
  },

  // Delete comment
  deleteComment: async (commentId) => {
    return await api.delete(`/comments/${commentId}`);
  }
};
