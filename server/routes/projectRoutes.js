const express = require('express');
const { body } = require('express-validator');
const {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  updateMemberRole,
  removeMember
} = require('../controllers/projectController');
const {
  getTasksByProject,
  createTask
} = require('../controllers/taskController');
const {
  getProjectAnalytics,
  getProjectActivity
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { requireProjectRole } = require('../middleware/checkProjectRole');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(protect); // All project routes require valid JWT

// Project Validations
const projectCreateValidation = [
  body('name').trim().notEmpty().withMessage('Project name is required'),
  body('key')
    .trim()
    .isLength({ min: 2, max: 10 })
    .withMessage('Project key must be between 2 and 10 characters'),
  validate
];

const memberAddValidation = [
  body('email').isEmail().withMessage('Valid user email required to add member'),
  body('role')
    .optional()
    .isIn(['admin', 'member', 'viewer'])
    .withMessage('Role must be admin, member, or viewer'),
  validate
];

const taskCreateValidation = [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  validate
];

// Base Project CRUD
router
  .route('/')
  .get(getProjects)
  .post(projectCreateValidation, createProject);

router
  .route('/:id')
  .get(requireProjectRole(['owner', 'admin', 'member', 'viewer']), getProjectById)
  .put(requireProjectRole(['owner', 'admin']), updateProject)
  .delete(requireProjectRole(['owner']), deleteProject);

// Member Management
router
  .route('/:id/members')
  .post(
    requireProjectRole(['owner', 'admin']),
    memberAddValidation,
    addMember
  );

router
  .route('/:id/members/:userId')
  .patch(requireProjectRole(['owner', 'admin']), updateMemberRole)
  .delete(requireProjectRole(['owner', 'admin']), removeMember);

// Tasks under Project
router
  .route('/:id/tasks')
  .get(requireProjectRole(['owner', 'admin', 'member', 'viewer']), getTasksByProject)
  .post(
    requireProjectRole(['owner', 'admin', 'member']),
    taskCreateValidation,
    createTask
  );

// Project Analytics & Audit Stream
router.get(
  '/:id/analytics',
  requireProjectRole(['owner', 'admin', 'member', 'viewer']),
  getProjectAnalytics
);

router.get(
  '/:id/activity',
  requireProjectRole(['owner', 'admin', 'member', 'viewer']),
  getProjectActivity
);

module.exports = router;
