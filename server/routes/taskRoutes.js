const express = require('express');
const { body } = require('express-validator');
const {
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  addSubtask,
  toggleSubtask,
  deleteSubtask
} = require('../controllers/taskController');
const {
  getTaskComments,
  addComment
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');
const { requireProjectRole } = require('../middleware/checkProjectRole');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(protect);

const commentValidation = [
  body('content').trim().notEmpty().withMessage('Comment content cannot be empty'),
  validate
];

const subtaskValidation = [
  body('title').trim().notEmpty().withMessage('Subtask title is required'),
  validate
];

// Direct Task Operations
router
  .route('/:id')
  .get(requireProjectRole(['owner', 'admin', 'member', 'viewer']), getTaskById)
  .put(requireProjectRole(['owner', 'admin', 'member']), updateTask)
  .delete(requireProjectRole(['owner', 'admin', 'member']), deleteTask);

// Status Update & Kanban Column Reordering
router.patch(
  '/:id/status',
  requireProjectRole(['owner', 'admin', 'member']),
  updateTaskStatus
);

// Subtask Checklist Operations
router.post(
  '/:id/subtasks',
  requireProjectRole(['owner', 'admin', 'member']),
  subtaskValidation,
  addSubtask
);

router.patch(
  '/:id/subtasks/:subtaskId',
  requireProjectRole(['owner', 'admin', 'member']),
  toggleSubtask
);

router.delete(
  '/:id/subtasks/:subtaskId',
  requireProjectRole(['owner', 'admin', 'member']),
  deleteSubtask
);

// Comments for Task
router
  .route('/:id/comments')
  .get(requireProjectRole(['owner', 'admin', 'member', 'viewer']), getTaskComments)
  .post(
    requireProjectRole(['owner', 'admin', 'member']),
    commentValidation,
    addComment
  );

module.exports = router;
