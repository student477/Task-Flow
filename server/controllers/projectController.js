const Project = require('../models/Project');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const Activity = require('../models/Activity');
const User = require('../models/User');

// @desc    Get all projects for current user
// @route   GET /api/v1/projects
// @access  Private
const getProjects = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find projects where user is owner or listed in members array
    const projects = await Project.find({
      $or: [{ owner: userId }, { 'members.user': userId }]
    })
      .populate('owner', 'name email avatarColor')
      .populate('members.user', 'name email avatarColor')
      .sort({ updatedAt: -1 });

    // Calculate dynamic stats for each project (task count, progress)
    const projectSummaries = await Promise.all(
      projects.map(async (project) => {
        const totalTasks = await Task.countDocuments({ project: project._id });
        const completedTasks = await Task.countDocuments({
          project: project._id,
          status: 'done'
        });
        const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

        return {
          ...project.toObject(),
          totalTasks,
          completedTasks,
          progress
        };
      })
    );

    res.status(200).json({
      success: true,
      count: projectSummaries.length,
      data: { projects: projectSummaries }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new project
// @route   POST /api/v1/projects
// @access  Private
const createProject = async (req, res, next) => {
  try {
    const { name, description, key, color, category } = req.body;
    const userId = req.user._id;

    // Verify key uniqueness for this owner
    const existingKey = await Project.findOne({
      owner: userId,
      key: key.toUpperCase().trim()
    });
    if (existingKey) {
      return res.status(400).json({
        success: false,
        message: `Project key '${key.toUpperCase()}' is already in use by one of your projects.`
      });
    }

    const project = await Project.create({
      name,
      description,
      key: key.toUpperCase().trim(),
      owner: userId,
      color: color || '#4f46e5',
      category: category || 'General',
      members: [
        {
          user: userId,
          role: 'owner',
          joinedAt: new Date()
        }
      ]
    });

    await Activity.create({
      project: project._id,
      user: userId,
      action: 'created_project',
      details: `Created project ${project.name} (${project.key})`
    });

    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name email avatarColor')
      .populate('members.user', 'name email avatarColor');

    res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      data: { project: populatedProject }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get project by ID
// @route   GET /api/v1/projects/:id
// @access  Private (Project Member)
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatarColor')
      .populate('members.user', 'name email avatarColor');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const totalTasks = await Task.countDocuments({ project: project._id });
    const completedTasks = await Task.countDocuments({
      project: project._id,
      status: 'done'
    });
    const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    res.status(200).json({
      success: true,
      data: {
        project: {
          ...project.toObject(),
          totalTasks,
          completedTasks,
          progress,
          userRole: req.userRole
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/v1/projects/:id
// @access  Private (Owner / Admin)
const updateProject = async (req, res, next) => {
  try {
    const { name, description, color, category, status } = req.body;
    const project = req.project;

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (color) project.color = color;
    if (category) project.category = category;
    if (status) project.status = status;

    await project.save();

    await Activity.create({
      project: project._id,
      user: req.user._id,
      action: 'updated_project',
      details: `Updated project settings for ${project.name}`
    });

    res.status(200).json({
      success: true,
      message: 'Project updated successfully.',
      data: { project }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project (and cascade related tasks, comments, activities)
// @route   DELETE /api/v1/projects/:id
// @access  Private (Owner only)
const deleteProject = async (req, res, next) => {
  try {
    const projectId = req.project._id;

    await Task.deleteMany({ project: projectId });
    await Comment.deleteMany({ project: projectId });
    await Activity.deleteMany({ project: projectId });
    await Project.findByIdAndDelete(projectId);

    res.status(200).json({
      success: true,
      message: 'Project and all associated tasks deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to project
// @route   POST /api/v1/projects/:id/members
// @access  Private (Owner / Admin)
const addMember = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const project = req.project;

    const userToAdd = await User.findOne({ email: email.toLowerCase().trim() });
    if (!userToAdd) {
      return res.status(404).json({
        success: false,
        message: `No user found with email '${email}'.`
      });
    }

    // Check if user is already a member
    const alreadyMember = project.members.some(
      (m) => m.user.toString() === userToAdd._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'This user is already a member of the project.'
      });
    }

    project.members.push({
      user: userToAdd._id,
      role: role || 'member',
      joinedAt: new Date()
    });

    await project.save();

    await Activity.create({
      project: project._id,
      user: req.user._id,
      action: 'added_member',
      details: `Added ${userToAdd.name} (${userToAdd.email}) as ${role || 'member'}`
    });

    const updated = await Project.findById(project._id)
      .populate('owner', 'name email avatarColor')
      .populate('members.user', 'name email avatarColor');

    res.status(200).json({
      success: true,
      message: `Member ${userToAdd.name} added to project.`,
      data: { members: updated.members }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project member role
// @route   PATCH /api/v1/projects/:id/members/:userId
// @access  Private (Owner / Admin)
const updateMemberRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const project = req.project;

    if (!['admin', 'member', 'viewer'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Role must be 'admin', 'member', or 'viewer'."
      });
    }

    if (project.owner.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change the primary project owner role.'
      });
    }

    const member = project.members.find((m) => m.user.toString() === userId);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found in project.' });
    }

    member.role = role;
    await project.save();

    await Activity.create({
      project: project._id,
      user: req.user._id,
      action: 'updated_role',
      details: `Updated member role to ${role}`
    });

    res.status(200).json({
      success: true,
      message: 'Member role updated successfully.',
      data: { members: project.members }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from project
// @route   DELETE /api/v1/projects/:id/members/:userId
// @access  Private (Owner / Admin)
const removeMember = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const project = req.project;

    if (project.owner.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the primary project owner.'
      });
    }

    project.members = project.members.filter(
      (m) => m.user.toString() !== userId
    );
    await project.save();

    // Reassign tasks assigned to this user to unassigned
    await Task.updateMany(
      { project: project._id, assignee: userId },
      { $set: { assignee: null } }
    );

    await Activity.create({
      project: project._id,
      user: req.user._id,
      action: 'removed_member',
      details: `Removed member from project`
    });

    res.status(200).json({
      success: true,
      message: 'Member removed from project successfully.',
      data: { members: project.members }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  updateMemberRole,
  removeMember
};
