const Task = require('../models/Task');
const Project = require('../models/Project');
const Comment = require('../models/Comment');
const Activity = require('../models/Activity');

// @desc    Get all tasks for a project (with filters & search)
// @route   GET /api/v1/projects/:id/tasks
// @access  Private (Project Member)
const getTasksByProject = async (req, res, next) => {
  try {
    const projectId = req.project._id;
    const { status, priority, assignee, search } = req.query;

    const query = { project: projectId };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignee) query.assignee = assignee;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { taskNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(query)
      .populate('assignee', 'name email avatarColor')
      .populate('reporter', 'name email avatarColor')
      .sort({ orderIndex: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: { tasks }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new task in a project
// @route   POST /api/v1/projects/:id/tasks
// @access  Private (Owner, Admin, Member)
const createTask = async (req, res, next) => {
  try {
    const project = req.project;
    const {
      title,
      description,
      status,
      priority,
      assignee,
      dueDate,
      tags
    } = req.body;

    // Determine auto-incrementing task number based on existing count
    const totalCount = await Task.countDocuments({ project: project._id });
    const taskNumber = `${project.key}-${totalCount + 1}`;

    // Calculate next orderIndex for this status column
    const highestOrderTask = await Task.findOne({
      project: project._id,
      status: status || 'todo'
    }).sort({ orderIndex: -1 });

    const nextOrder = highestOrderTask ? highestOrderTask.orderIndex + 1 : 0;

    const task = await Task.create({
      project: project._id,
      taskNumber,
      title,
      description: description || '',
      status: status || 'todo',
      priority: priority || 'medium',
      assignee: assignee || null,
      reporter: req.user._id,
      dueDate: dueDate || null,
      tags: tags || [],
      orderIndex: nextOrder
    });

    await Activity.create({
      project: project._id,
      user: req.user._id,
      task: task._id,
      action: 'created_task',
      details: `Created task ${task.taskNumber}: "${task.title}"`
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email avatarColor')
      .populate('reporter', 'name email avatarColor');

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: { task: populatedTask }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get task by ID
// @route   GET /api/v1/tasks/:id
// @access  Private (Project Member)
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email avatarColor')
      .populate('reporter', 'name email avatarColor')
      .populate('project', 'name key color');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const comments = await Comment.find({ task: task._id })
      .populate('user', 'name email avatarColor')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: {
        task,
        comments
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task details
// @route   PUT /api/v1/tasks/:id
// @access  Private (Owner, Admin, Member)
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const {
      title,
      description,
      priority,
      assignee,
      dueDate,
      tags
    } = req.body;

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority) task.priority = priority;
    if (assignee !== undefined) task.assignee = assignee;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (tags !== undefined) task.tags = tags;

    await task.save();

    await Activity.create({
      project: task.project,
      user: req.user._id,
      task: task._id,
      action: 'updated_task',
      details: `Updated details for ${task.taskNumber}`
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email avatarColor')
      .populate('reporter', 'name email avatarColor');

    res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      data: { task: populatedTask }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status & reorder (Kanban drag-and-drop)
// @route   PATCH /api/v1/tasks/:id/status
// @access  Private (Owner, Admin, Member)
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status, orderIndex } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const oldStatus = task.status;
    if (status && status !== oldStatus) {
      task.status = status;

      await Activity.create({
        project: task.project,
        user: req.user._id,
        task: task._id,
        action: 'status_changed',
        details: `Moved ${task.taskNumber} from ${oldStatus} to ${status}`
      });
    }

    if (orderIndex !== undefined) {
      task.orderIndex = orderIndex;
    }

    await task.save();

    res.status(200).json({
      success: true,
      message: 'Task status updated.',
      data: { task }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/v1/tasks/:id
// @access  Private (Owner, Admin, or Reporter)
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    await Comment.deleteMany({ task: task._id });
    await Task.findByIdAndDelete(task._id);

    await Activity.create({
      project: task.project,
      user: req.user._id,
      action: 'updated_task',
      details: `Deleted task ${task.taskNumber}: "${task.title}"`
    });

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add subtask checklist item
// @route   POST /api/v1/tasks/:id/subtasks
// @access  Private (Owner, Admin, Member)
const addSubtask = async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Subtask title is required' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    task.subtasks.push({ title, completed: false });
    await task.save();

    res.status(201).json({
      success: true,
      message: 'Subtask added.',
      data: { subtasks: task.subtasks }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle subtask completion
// @route   PATCH /api/v1/tasks/:id/subtasks/:subtaskId
// @access  Private (Owner, Admin, Member)
const toggleSubtask = async (req, res, next) => {
  try {
    const { id, subtaskId } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const subtask = task.subtasks.id(subtaskId);
    if (!subtask) {
      return res.status(404).json({ success: false, message: 'Subtask not found.' });
    }

    subtask.completed = !subtask.completed;
    await task.save();

    res.status(200).json({
      success: true,
      message: `Subtask marked as ${subtask.completed ? 'completed' : 'incomplete'}.`,
      data: { subtask, subtasks: task.subtasks }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a subtask
// @route   DELETE /api/v1/tasks/:id/subtasks/:subtaskId
// @access  Private (Owner, Admin, Member)
const deleteSubtask = async (req, res, next) => {
  try {
    const { id, subtaskId } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    task.subtasks = task.subtasks.filter((s) => s._id.toString() !== subtaskId);
    await task.save();

    res.status(200).json({
      success: true,
      message: 'Subtask deleted successfully.',
      data: { subtasks: task.subtasks }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasksByProject,
  createTask,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
  addSubtask,
  toggleSubtask,
  deleteSubtask
};
