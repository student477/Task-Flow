const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member', 'viewer'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Project name cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    key: {
      type: String,
      required: [true, 'Project key is required'],
      uppercase: true,
      trim: true,
      maxlength: [10, 'Project key cannot exceed 10 characters']
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: [memberSchema],
    color: {
      type: String,
      default: '#4f46e5'
    },
    category: {
      type: String,
      trim: true,
      default: 'General'
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'completed'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast project lookup
projectSchema.index({ 'members.user': 1 });
projectSchema.index({ owner: 1 });
projectSchema.index({ key: 1, owner: 1 }, { unique: true });

module.exports = mongoose.model('Project', projectSchema);
