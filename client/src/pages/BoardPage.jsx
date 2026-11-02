import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  CheckSquare,
  Clock,
  Trash2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  Loader2,
  Calendar,
  User,
  ChevronDown,
  Edit2,
  Save,
  X
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { commentService } from '../services/commentService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const COLUMNS = [
  { id: 'backlog', title: 'Backlog', dotColor: 'bg-slate-400' },
  { id: 'todo', title: 'To Do', dotColor: 'bg-blue-500' },
  { id: 'in-progress', title: 'In Progress', dotColor: 'bg-indigo-500' },
  { id: 'in-review', title: 'In Review', dotColor: 'bg-amber-500' },
  { id: 'done', title: 'Done', dotColor: 'bg-emerald-500' },
];

export default function BoardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [activeMobileColumn, setActiveMobileColumn] = useState('all');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [defaultColumnForCreate, setDefaultColumnForCreate] = useState('todo');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editFormData, setEditFormData] = useState({ title: '', description: '', priority: '', status: '' });
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Task form state
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    assignee: '',
    dueDate: '',
    tags: ''
  });
  const [submittingTask, setSubmittingTask] = useState(false);

  // Drag-and-drop state
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  // Load Projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await projectService.getProjects();
        const list = res.data?.projects || [];
        setProjects(list);

        const paramProjId = searchParams.get('project');
        if (paramProjId) {
          const match = list.find((p) => p._id === paramProjId);
          if (match) setSelectedProject(match);
          else if (list.length > 0) setSelectedProject(list[0]);
        } else if (list.length > 0) {
          setSelectedProject(list[0]);
          setSearchParams({ project: list[0]._id });
        }
      } catch (err) {
        setError(err.message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Fetch Tasks when project changes or filters change
  const loadTasks = async () => {
    if (!selectedProject?._id) return;
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (priorityFilter) params.priority = priorityFilter;

      const res = await taskService.getTasksByProject(selectedProject._id, params);
      setTasks(res.data?.tasks || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  useEffect(() => {
    if (selectedProject?._id) {
      loadTasks();
    }
  }, [selectedProject, searchQuery, priorityFilter]);

  // Handle Project Change
  const handleSelectProject = (projectId) => {
    const proj = projects.find((p) => p._id === projectId);
    if (proj) {
      setSelectedProject(proj);
      setSearchParams({ project: proj._id });
    }
  };

  // Open Create Task Modal
  const openCreateModal = (columnId = 'todo') => {
    setDefaultColumnForCreate(columnId);
    setTaskForm({
      title: '',
      description: '',
      priority: 'medium',
      status: columnId,
      assignee: selectedProject?.members?.[0]?.user?._id || '',
      dueDate: '',
      tags: ''
    });
    setCreateModalOpen(true);
  };

  // Submit Create Task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    setSubmittingTask(true);

    try {
      const payload = {
        title: taskForm.title.trim(),
        description: taskForm.description,
        priority: taskForm.priority,
        status: taskForm.status,
        assignee: taskForm.assignee || null,
        dueDate: taskForm.dueDate || null,
        tags: taskForm.tags ? taskForm.tags.split(',').map((t) => t.trim()).filter(Boolean) : []
      };

      await taskService.createTask(selectedProject._id, payload);
      setCreateModalOpen(false);
      toast.success('Task created successfully in MongoDB!');
      await loadTasks();
    } catch (err) {
      toast.error(`Failed to create task: ${err.message}`);
    } finally {
      setSubmittingTask(false);
    }
  };

  // Open Task Detail Modal & Load Comments
  const openTaskDetail = async (task) => {
    setActiveTask(task);
    setIsEditingTask(false);
    setEditFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status
    });
    setDetailModalOpen(true);
    try {
      const res = await commentService.getComments(task._id);
      setComments(res.data?.comments || []);
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  // Save Task Inline Edits
  const handleSaveTaskEdits = async () => {
    if (!editFormData.title.trim() || !activeTask) return;
    try {
      const res = await taskService.updateTask(activeTask._id, {
        title: editFormData.title.trim(),
        description: editFormData.description,
        priority: editFormData.priority
      });

      // Update status if changed
      if (editFormData.status !== activeTask.status) {
        await taskService.updateTaskStatus(activeTask._id, editFormData.status);
      }

      setActiveTask({
        ...activeTask,
        title: editFormData.title.trim(),
        description: editFormData.description,
        priority: editFormData.priority,
        status: editFormData.status
      });
      setIsEditingTask(false);
      toast.success('Task updated successfully.');
      await loadTasks();
    } catch (err) {
      toast.error(`Update failed: ${err.message}`);
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    setDragOverCol(colId);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!taskId) return;

    // Optimistically update UI
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: targetStatus } : t))
    );

    try {
      await taskService.updateTaskStatus(taskId, targetStatus);
      toast.info(`Task moved to ${targetStatus.replace('-', ' ')}`);
    } catch (err) {
      toast.error('Failed to update task status in backend.');
      await loadTasks();
    }
  };

  // Add Comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !activeTask) return;

    try {
      const res = await commentService.addComment(activeTask._id, newComment.trim());
      setComments((prev) => [...prev, res.data.comment]);
      setNewComment('');
      toast.success('Comment posted.');
    } catch (err) {
      toast.error(`Failed to post comment: ${err.message}`);
    }
  };

  // Add Subtask
  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !activeTask) return;

    try {
      const res = await taskService.addSubtask(activeTask._id, newSubtaskTitle.trim());
      setActiveTask((prev) => ({ ...prev, subtasks: res.data.subtasks }));
      setNewSubtaskTitle('');
      toast.success('Checklist item added.');
      await loadTasks();
    } catch (err) {
      toast.error(`Failed to add subtask: ${err.message}`);
    }
  };

  // Toggle Subtask
  const handleToggleSubtask = async (subtaskId) => {
    try {
      const res = await taskService.toggleSubtask(activeTask._id, subtaskId);
      setActiveTask((prev) => ({ ...prev, subtasks: res.data.subtasks }));
      await loadTasks();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskService.deleteTask(taskId);
      setDetailModalOpen(false);
      toast.success('Task deleted successfully.');
      await loadTasks();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading && projects.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-2" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <Card padding="p-12" className="text-center">
        <h3 className="text-lg font-bold text-slate-900">No Projects Available</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
          You need an active project before managing tasks and Kanban columns.
        </p>
        <Button variant="primary" onClick={() => navigate('/projects')}>
          Go to Projects
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {/* Board Controls & Project Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/90 shadow-subtle">
        <div className="flex flex-wrap items-center gap-3">
          {/* Project Switcher */}
          <div className="relative">
            <select
              value={selectedProject?._id || ''}
              onChange={(e) => handleSelectProject(e.target.value)}
              className="pl-3 pr-8 py-1.5 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 appearance-none cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.key} • {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="h-4 w-[1px] bg-slate-200 hidden sm:block" />

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-800 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 w-44 sm:w-56"
            />
          </div>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs text-slate-700 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => openCreateModal('todo')}
          >
            New Task
          </Button>
        </div>
      </div>

      {/* Mobile Column Selector Pills */}
      <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto pb-2 text-xs">
        <button
          onClick={() => setActiveMobileColumn('all')}
          className={`px-3 py-1 rounded-full font-medium whitespace-nowrap transition-colors ${
            activeMobileColumn === 'all'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          All Stages ({tasks.length})
        </button>
        {COLUMNS.map((col) => {
          const count = tasks.filter((t) => t.status === col.id).length;
          return (
            <button
              key={col.id}
              onClick={() => setActiveMobileColumn(col.id)}
              className={`px-3 py-1 rounded-full font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeMobileColumn === col.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${col.dotColor}`} />
              <span>{col.title} ({count})</span>
            </button>
          );
        })}
      </div>

      {/* Kanban Multi-Column Grid (Responsive horizontal scroll on mobile/tablet) */}
      <div className="flex lg:grid lg:grid-cols-5 gap-4 overflow-x-auto pb-4 items-start scrollbar-thin">
        {COLUMNS.map((col) => {
          if (activeMobileColumn !== 'all' && activeMobileColumn !== col.id) {
            return null;
          }

          const colTasks = tasks.filter((t) => t.status === col.id);
          const isOver = dragOverCol === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`min-w-[280px] lg:min-w-0 flex-1 rounded-xl p-3 flex flex-col min-h-[550px] transition-colors border ${
                isOver
                  ? 'bg-brand-50/70 border-brand-300 ring-2 ring-brand-400/20'
                  : 'bg-slate-100/70 border-slate-200/80'
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {col.title}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 bg-white px-1.5 py-0.2 rounded-full border border-slate-200">
                    {colTasks.length}
                  </span>
                </div>
              </div>

              {/* Task Cards List */}
              <div className="space-y-2.5 flex-1">
                {colTasks.map((task) => (
                  <div
                    key={task._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task._id)}
                    onClick={() => openTaskDetail(task)}
                    className="p-3 bg-white rounded-lg border border-slate-200/90 shadow-subtle hover:shadow-card hover:border-brand-500/50 transition-all cursor-grab active:cursor-grabbing group select-none"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">
                        {task.taskNumber}
                      </span>
                      <Badge type="priority" value={task.priority} withDot={false} />
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors leading-snug">
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-2">
                        {task.subtasks && task.subtasks.length > 0 && (
                          <span className="flex items-center gap-1 font-mono">
                            <CheckSquare className="w-3 h-3 text-slate-400" />
                            <span>
                              {task.subtasks.filter((s) => s.completed).length}/
                              {task.subtasks.length}
                            </span>
                          </span>
                        )}
                        {task.dueDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                          </span>
                        )}
                      </div>
                      <Avatar
                        name={task.assignee?.name || 'Unassigned'}
                        bg={task.assignee?.avatarColor || 'bg-slate-400'}
                        size="xs"
                      />
                    </div>
                  </div>
                ))}

                {colTasks.length === 0 && (
                  <div className="p-4 rounded-lg border border-dashed border-slate-200 text-center text-xs text-slate-400 flex flex-col items-center justify-center min-h-[90px]">
                    Drop task here
                  </div>
                )}
              </div>

              {/* Quick Add Button */}
              <button
                onClick={() => openCreateModal(col.id)}
                className="mt-3 w-full py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg flex items-center justify-center gap-1 transition-colors border border-transparent hover:border-slate-300/70"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* CREATE TASK MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={`New Task — ${selectedProject?.key || ''}`}
        subtitle="Create an initiative task with priority and assignee"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Task Title"
            placeholder="e.g. Implement refresh token rotation"
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Add implementation notes, acceptance criteria..."
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Initial Column
              </label>
              <select
                value={taskForm.status}
                onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                {COLUMNS.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Assignee
              </label>
              <select
                value={taskForm.assignee}
                onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                <option value="">Unassigned</option>
                {selectedProject?.members?.map((m) => (
                  <option key={m.user?._id || Math.random()} value={m.user?._id}>
                    {m.user?.name || 'Member'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Input
                label="Due Date"
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
              />
            </div>
          </div>

          <Input
            label="Tags (Comma-separated)"
            placeholder="Security, Backend, Sprint-14"
            value={taskForm.tags}
            onChange={(e) => setTaskForm({ ...taskForm, tags: e.target.value })}
          />

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={submittingTask}
            >
              Create Task
            </Button>
          </div>
        </form>
      </Modal>

      {/* TASK DETAIL & EDIT MODAL (Subtasks + Comments) */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={
          activeTask
            ? isEditingTask
              ? `Edit ${activeTask.taskNumber}`
              : `${activeTask.taskNumber}: ${activeTask.title}`
            : ''
        }
        subtitle={`Sprint Initiative • ${selectedProject?.name || ''}`}
        maxWidth="max-w-2xl"
      >
        {activeTask && (
          <div className="space-y-6">
            {/* Action Bar (Edit Toggle / Delete) */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Badge type="priority" value={activeTask.priority} />
                <Badge type="status" value={activeTask.status} />
              </div>

              <div className="flex items-center gap-2">
                {isEditingTask ? (
                  <>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => setIsEditingTask(false)}
                      icon={X}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="xs"
                      onClick={handleSaveTaskEdits}
                      icon={Save}
                    >
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => setIsEditingTask(true)}
                    icon={Edit2}
                  >
                    Edit Task
                  </Button>
                )}
              </div>
            </div>

            {/* Editable Mode vs View Mode */}
            {isEditingTask ? (
              <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <Input
                  label="Task Title"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  required
                />

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Priority
                    </label>
                    <select
                      value={editFormData.priority}
                      onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value })}
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 text-slate-900 focus:outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Status Stage
                    </label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 text-slate-900 focus:outline-none"
                    >
                      {COLUMNS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </div>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {activeTask.description || 'No detailed description provided.'}
                </p>
              </div>
            )}

            {/* Subtasks Checklist */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Checklist & Subtasks ({activeTask.subtasks?.filter((s) => s.completed).length || 0}/
                  {activeTask.subtasks?.length || 0})
                </span>
              </div>

              {/* Subtasks items */}
              <div className="space-y-1.5 mb-2.5 max-h-40 overflow-y-auto">
                {activeTask.subtasks?.map((sub) => (
                  <div
                    key={sub._id}
                    onClick={() => handleToggleSubtask(sub._id)}
                    className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 hover:bg-slate-100/80 cursor-pointer border border-slate-200 transition-colors text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={sub.completed}
                      onChange={() => {}}
                      className="rounded text-brand-600 focus:ring-brand-500 pointer-events-none"
                    />
                    <span
                      className={`flex-1 ${
                        sub.completed ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}
                    >
                      {sub.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Add subtask input */}
              <form onSubmit={handleAddSubtask} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add item..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
                <Button type="submit" variant="secondary" size="sm">
                  Add Item
                </Button>
              </form>
            </div>

            {/* Comments Thread */}
            <div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-brand-600" />
                <span>Discussion Thread ({comments.length})</span>
              </div>

              {/* Comments list */}
              <div className="space-y-2.5 mb-3 max-h-44 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment._id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <Avatar
                          name={comment.user?.name || 'User'}
                          bg={comment.user?.avatarColor || 'bg-brand-600'}
                          size="xs"
                        />
                        <span className="font-semibold text-slate-800">
                          {comment.user?.name || 'User'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-snug pl-5">{comment.content}</p>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="text-xs text-slate-400 italic">No comments yet. Start the conversation!</p>
                )}
              </div>

              {/* Post comment input */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
                <Button type="submit" variant="primary" size="sm" icon={Send}>
                  Post
                </Button>
              </form>
            </div>

            {/* Task Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => handleDeleteTask(activeTask._id)}
                className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Task</span>
              </button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setDetailModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
