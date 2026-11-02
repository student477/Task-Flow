const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Activity = require('../models/Activity');

// @desc    Get all comments for a task
// @route   GET /api/v1/tasks/:id/comments
// @access  Private (Project Member)
const getTaskComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ task: req.params.id })
      .populate('user', 'name email avatarColor')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      data: { comments }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to a task
// @route   POST /api/v1/tasks/:id/comments
// @access  Private (Project Member)
const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const comment = await Comment.create({
      task: task._id,
      project: task.project,
      user: req.user._id,
      content
    });

    await Activity.create({
      project: task.project,
      user: req.user._id,
      task: task._id,
      action: 'added_comment',
      details: `Commented on ${task.taskNumber}`
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      'user',
      'name email avatarColor'
    );

    res.status(201).json({
      success: true,
      message: 'Comment posted.',
      data: { comment: populatedComment }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a comment
// @route   DELETE /api/v1/comments/:id
// @access  Private (Author, Admin, or Project Owner)
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found.' });
    }

    const isAuthor = comment.user.toString() === req.user._id.toString();
    const isOwnerOrAdmin = ['owner', 'admin'].includes(req.userRole);

    if (!isAuthor && !isOwnerOrAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only delete your own comments.'
      });
    }

    await Comment.findByIdAndDelete(comment._id);

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTaskComments,
  addComment,
  deleteComment
};
