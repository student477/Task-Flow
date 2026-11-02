const Task = require('../models/Task');
const Project = require('../models/Project');
const Activity = require('../models/Activity');

// @desc    Get aggregate workspace metrics for current user
// @route   GET /api/v1/dashboard/stats
// @access  Private
const getWorkspaceStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find all projects where user is owner or member
    const userProjects = await Project.find({
      $or: [{ owner: userId }, { 'members.user': userId }]
    }).select('_id name key color');

    const projectIds = userProjects.map((p) => p._id);

    // Calculate dynamic task metrics across these projects
    const totalTasks = await Task.countDocuments({ project: { $in: projectIds } });
    const inProgressTasks = await Task.countDocuments({
      project: { $in: projectIds },
      status: 'in-progress'
    });
    const completedTasks = await Task.countDocuments({
      project: { $in: projectIds },
      status: 'done'
    });
    const inReviewTasks = await Task.countDocuments({
      project: { $in: projectIds },
      status: 'in-review'
    });
    const todoTasks = await Task.countDocuments({
      project: { $in: projectIds },
      status: 'todo'
    });
    const backlogTasks = await Task.countDocuments({
      project: { $in: projectIds },
      status: 'backlog'
    });

    // Overdue tasks (due date in the past and status is not done)
    const overdueTasks = await Task.countDocuments({
      project: { $in: projectIds },
      status: { $ne: 'done' },
      dueDate: { $lt: new Date() }
    });

    // Priority counts
    const urgentTasks = await Task.countDocuments({
      project: { $in: projectIds },
      priority: 'urgent'
    });
    const highTasks = await Task.countDocuments({
      project: { $in: projectIds },
      priority: 'high'
    });
    const mediumTasks = await Task.countDocuments({
      project: { $in: projectIds },
      priority: 'medium'
    });
    const lowTasks = await Task.countDocuments({
      project: { $in: projectIds },
      priority: 'low'
    });

    const completionRate =
      totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    // Recent priority tasks (critical path)
    const priorityTasks = await Task.find({
      project: { $in: projectIds },
      status: { $ne: 'done' }
    })
      .populate('project', 'name key color')
      .populate('assignee', 'name email avatarColor')
      .sort({
        priority: 1, // 'urgent', 'high'
        dueDate: 1
      })
      .limit(6);

    // Recent activity feed across projects
    const recentActivities = await Activity.find({
      project: { $in: projectIds }
    })
      .populate('user', 'name email avatarColor')
      .populate('project', 'name key color')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalProjects: userProjects.length,
          totalTasks,
          inProgressTasks,
          completedTasks,
          inReviewTasks,
          todoTasks,
          backlogTasks,
          overdueTasks,
          completionRate
        },
        priorityBreakdown: {
          urgent: urgentTasks,
          high: highTasks,
          medium: mediumTasks,
          low: lowTasks
        },
        statusDistribution: {
          done: completedTasks,
          inProgress: inProgressTasks,
          inReview: inReviewTasks,
          todo: todoTasks,
          backlog: backlogTasks
        },
        priorityTasks,
        recentActivities
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed analytics for a single project
// @route   GET /api/v1/projects/:id/analytics
// @access  Private (Project Member)
const getProjectAnalytics = async (req, res, next) => {
  try {
    const projectId = req.project._id;

    const totalTasks = await Task.countDocuments({ project: projectId });
    const completedTasks = await Task.countDocuments({
      project: projectId,
      status: 'done'
    });
    const inProgressTasks = await Task.countDocuments({
      project: projectId,
      status: 'in-progress'
    });
    const inReviewTasks = await Task.countDocuments({
      project: projectId,
      status: 'in-review'
    });
    const todoTasks = await Task.countDocuments({
      project: projectId,
      status: 'todo'
    });
    const backlogTasks = await Task.countDocuments({
      project: projectId,
      status: 'backlog'
    });

    const overdueTasks = await Task.countDocuments({
      project: projectId,
      status: { $ne: 'done' },
      dueDate: { $lt: new Date() }
    });

    const completionRate =
      totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    // Priority breakdown
    const priorityStats = await Task.aggregate([
      { $match: { project: projectId } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Workload by assignee
    const assigneeStats = await Task.aggregate([
      { $match: { project: projectId } },
      { $group: { _id: '$assignee', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        inReviewTasks,
        todoTasks,
        backlogTasks,
        overdueTasks,
        completionRate,
        priorityStats,
        assigneeStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent activity audit stream for a project
// @route   GET /api/v1/projects/:id/activity
// @access  Private (Project Member)
const getProjectActivity = async (req, res, next) => {
  try {
    const activities = await Activity.find({ project: req.project._id })
      .populate('user', 'name email avatarColor')
      .populate('task', 'taskNumber title')
      .sort({ createdAt: -1 })
      .limit(30);

    res.status(200).json({
      success: true,
      count: activities.length,
      data: { activities }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWorkspaceStats,
  getProjectAnalytics,
  getProjectActivity
};
