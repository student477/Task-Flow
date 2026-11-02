const Project = require('../models/Project');
const Task = require('../models/Task');

/**
 * Middleware factory to enforce Project RBAC permissions.
 * Supports routes under /projects (where :id is projectId)
 * and routes under /tasks (where :id is taskId).
 * @param {Array<string>} allowedRoles - e.g. ['owner', 'admin', 'member', 'viewer']
 */
const requireProjectRole = (allowedRoles = ['owner', 'admin', 'member', 'viewer']) => {
  return async (req, res, next) => {
    try {
      let projectId = req.params.projectId || req.body.project;

      // If under /projects routes, req.params.id is projectId
      if (!projectId && req.baseUrl.includes('/projects') && req.params.id) {
        projectId = req.params.id;
      }

      // If under /tasks routes, req.params.id or req.params.taskId is taskId
      if (!projectId && (req.baseUrl.includes('/tasks') || req.params.taskId)) {
        const taskId = req.params.taskId || req.params.id;
        const task = await Task.findById(taskId);
        if (!task) {
          return res.status(404).json({
            success: false,
            message: 'Task not found.'
          });
        }
        projectId = task.project;
        req.task = task;
      }

      if (!projectId) {
        return res.status(400).json({
          success: false,
          message: 'Project identifier is required for authorization.'
        });
      }

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found.'
        });
      }

      const userId = req.user._id.toString();

      // Check if user is the Project Owner
      let role = null;
      if (project.owner.toString() === userId) {
        role = 'owner';
      } else {
        const member = project.members.find(
          (m) => m.user.toString() === userId
        );
        if (member) {
          role = member.role;
        }
      }

      if (!role) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You are not a member of this project.'
        });
      }

      if (!allowedRoles.includes(role)) {
        return res.status(403).json({
          success: false,
          message: `Forbidden: Action requires one of [${allowedRoles.join(', ')}]. Your role is '${role}'.`
        });
      }

      req.project = project;
      req.userRole = role;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { requireProjectRole };
