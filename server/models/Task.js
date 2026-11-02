const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Subtask title is required'],
      trim: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);

const taskSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required']
    },
    taskNumber: {
      type: String,
      required: true,
      trim: true
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [150, 'Task title cannot exceed 150 characters']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['backlog', 'todo', 'in-progress', 'in-review', 'done'],
      default: 'todo'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    dueDate: {
      type: Date,
      default: null
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    subtasks: [subtaskSchema],
    orderIndex: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast column and project querying
taskSchema.index({ project: 1, status: 1, orderIndex: 1 });
taskSchema.index({ project: 1, taskNumber: 1 }, { unique: true });
taskSchema.index({ assignee: 1 });

module.exports = mongoose.model('Task', taskSchema);
