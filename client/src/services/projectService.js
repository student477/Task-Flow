import api from './api';

export const projectService = {
  // Get all projects for current user
  getProjects: async () => {
    return await api.get('/projects');
  },

  // Get project by ID
  getProjectById: async (id) => {
    return await api.get(`/projects/${id}`);
  },

  // Create new project
  createProject: async (projectData) => {
    return await api.post('/projects', projectData);
  },

  // Update existing project
  updateProject: async (id, projectData) => {
    return await api.put(`/projects/${id}`, projectData);
  },

  // Delete project (cascade cleanup)
  deleteProject: async (id) => {
    return await api.delete(`/projects/${id}`);
  },

  // Add member to project
  addMember: async (id, memberData) => {
    return await api.post(`/projects/${id}/members`, memberData);
  },

  // Update member role
  updateMemberRole: async (id, userId, role) => {
    return await api.patch(`/projects/${id}/members/${userId}`, { role });
  },

  // Remove member from project
  removeMember: async (id, userId) => {
    return await api.delete(`/projects/${id}/members/${userId}`);
  }
};
