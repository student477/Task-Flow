const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null
    },
    action: {
      type: String,
      required: true,
      enum: [
        'created_project',
        'updated_project',
        'created_task',
        'updated_task',
        'status_changed',
        'added_comment',
        'added_member',
        'removed_member',
        'updated_role'
      ]
    },
    details: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

activitySchema.index({ project: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
