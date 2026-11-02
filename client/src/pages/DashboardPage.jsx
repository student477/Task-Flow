import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderKanban,
  Plus,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Loader2,
  Check
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import { dashboardService } from '../services/dashboardService';
import { projectService } from '../services/projectService';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, projectsRes] = await Promise.all([
        dashboardService.getWorkspaceStats(),
        projectService.getProjects()
      ]);

      setStats(statsRes.data);
      setProjects(projectsRes.data?.projects || []);
    } catch (err) {
      setError(err.message || 'Failed to load workspace analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-2" />
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Compiling Live MongoDB Metrics...
        </p>
      </div>
    );
  }

  const summary = stats?.summary || {
    totalProjects: 0,
    totalTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    inReviewTasks: 0,
    todoTasks: 0,
    backlogTasks: 0,
    overdueTasks: 0,
    completionRate: 0
  };

  const priorityBreakdown = stats?.priorityBreakdown || {
    urgent: 0,
    high: 0,
    medium: 0,
    low: 0
  };

  const priorityTasks = stats?.priorityTasks || [];
  const recentActivities = stats?.recentActivities || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Workspace Operations Live</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.name || 'Engineer'}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Active workspace metrics calculated directly from your MongoDB collections.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={loadDashboardData}
            className="text-xs"
          >
            Refresh Metrics
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => {
              if (projects.length > 0) {
                navigate(`/board?project=${projects[0]._id}`);
              } else {
                navigate('/projects');
              }
            }}
            className="text-xs"
          >
            Create Task
          </Button>
        </div>
      </div>

      {/* KPI Stat Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <Card padding="p-4" hoverEffect>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Tasks
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-brand-600 flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {summary.totalTasks}
            </span>
            <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              Live DB
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Across {summary.totalProjects} active project{summary.totalProjects === 1 ? '' : 's'}
          </div>
        </Card>

        {/* In Progress */}
        <Card padding="p-4" hoverEffect>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              In Progress
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {summary.inProgressTasks}
            </span>
            <span className="text-xs font-medium text-slate-500">Active now</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">Currently in sprint execution</div>
        </Card>

        {/* Completed */}
        <Card padding="p-4" hoverEffect>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Completed
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {summary.completedTasks}
            </span>
            <span className="text-xs font-medium text-emerald-600">
              {summary.completionRate}% completion rate
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-400">Verified through database status</div>
        </Card>

        {/* Overdue / Needs Attention */}
        <Card padding="p-4" hoverEffect>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Needs Attention
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-rose-600">
              {summary.overdueTasks}
            </span>
            <span className="text-xs font-medium text-rose-600">
              {summary.overdueTasks > 0 ? 'Overdue Deadlines' : 'All on track'}
            </span>
          </div>
          <div className="mt-2 text-xs text-rose-500/80">
            {summary.overdueTasks > 0 ? 'Exceeded SLA target' : 'Zero overdue tasks'}
          </div>
        </Card>
      </div>

      {/* Main Grid: Projects & Tasks (Left) + Velocity & Feed (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Projects Cards */}
          <Card padding="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Active Initiatives</h3>
                <p className="text-xs text-slate-500">Live progress tracking across initiatives</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/projects')}
                className="text-xs text-brand-600 hover:text-brand-700"
              >
                View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>

            {projects.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                No active projects yet.{' '}
                <button
                  onClick={() => navigate('/projects')}
                  className="text-brand-600 font-bold hover:underline"
                >
                  Create one now
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {projects.slice(0, 3).map((project) => (
                  <div
                    key={project._id}
                    onClick={() => navigate(`/board?project=${project._id}`)}
                    className="p-3.5 rounded-xl border border-slate-200/80 hover:border-brand-500/50 hover:shadow-subtle transition-all cursor-pointer bg-slate-50/50 hover:bg-white group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white"
                        style={{ backgroundColor: project.color || '#4f46e5' }}
                      >
                        {project.key}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400">
                        {project.category || 'General'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors truncate">
                      {project.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      {project.description || 'No description provided.'}
                    </p>

                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-600">{project.progress || 0}% Complete</span>
                        <span className="text-slate-400 font-mono">
                          {project.completedTasks || 0}/{project.totalTasks || 0}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${project.progress || 0}%`,
                            backgroundColor: project.color || '#4f46e5'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Critical Path Tasks */}
          <Card padding="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Sprint Priority Tasks</h3>
                <p className="text-xs text-slate-500">High and urgent priority tasks pending resolution</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (projects.length > 0) navigate(`/board?project=${projects[0]._id}`);
                  else navigate('/projects');
                }}
                className="text-xs text-brand-600 hover:text-brand-700"
              >
                Go to Kanban <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>

            {priorityTasks.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                No high or urgent pending tasks in your workspace.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {priorityTasks.map((task) => (
                  <div
                    key={task._id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/70 -mx-2 px-2 rounded-lg transition-colors group cursor-pointer"
                    onClick={() => navigate(`/board?project=${task.project?._id || task.project}`)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-5 h-5 rounded-md border border-slate-300 hover:border-brand-500 flex items-center justify-center shrink-0 cursor-pointer">
                        {task.status === 'done' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-400">
                            {task.taskNumber}
                          </span>
                          <h4 className="text-xs sm:text-sm font-semibold text-slate-800 truncate group-hover:text-brand-600 transition-colors">
                            {task.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                          <span>{task.project?.name || 'Project'}</span>
                          {task.subtasks && task.subtasks.length > 0 && (
                            <>
                              <span>•</span>
                              <span>
                                {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length} subtasks
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <Badge type="priority" value={task.priority} />
                      <Badge type="status" value={task.status} />
                      <Avatar
                        name={task.assignee?.name || 'Unassigned'}
                        bg={task.assignee?.avatarColor || 'bg-slate-400'}
                        size="xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status Distribution */}
          <Card padding="p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Status Distribution</h3>
            <p className="text-xs text-slate-500 mb-4">Calculated breakdown across all projects</p>

            {/* Segmented Progress Bar */}
            <div className="w-full h-3 rounded-full bg-slate-100 flex overflow-hidden mb-4">
              <div
                style={{
                  width: `${
                    summary.totalTasks === 0
                      ? 0
                      : Math.round((summary.completedTasks / summary.totalTasks) * 100)
                  }%`
                }}
                className="bg-emerald-500"
                title="Done"
              />
              <div
                style={{
                  width: `${
                    summary.totalTasks === 0
                      ? 0
                      : Math.round((summary.inProgressTasks / summary.totalTasks) * 100)
                  }%`
                }}
                className="bg-indigo-500"
                title="In Progress"
              />
              <div
                style={{
                  width: `${
                    summary.totalTasks === 0
                      ? 0
                      : Math.round((summary.inReviewTasks / summary.totalTasks) * 100)
                  }%`
                }}
                className="bg-amber-500"
                title="In Review"
              />
              <div
                style={{
                  width: `${
                    summary.totalTasks === 0
                      ? 0
                      : Math.round((summary.todoTasks / summary.totalTasks) * 100)
                  }%`
                }}
                className="bg-blue-400"
                title="To Do"
              />
              <div
                style={{
                  width: `${
                    summary.totalTasks === 0
                      ? 0
                      : Math.round((summary.backlogTasks / summary.totalTasks) * 100)
                  }%`
                }}
                className="bg-slate-300"
                title="Backlog"
              />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Done
                </span>
                <span className="font-semibold text-slate-900 font-mono">
                  {summary.completedTasks} tasks
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  In Progress
                </span>
                <span className="font-semibold text-slate-900 font-mono">
                  {summary.inProgressTasks} tasks
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  In Review
                </span>
                <span className="font-semibold text-slate-900 font-mono">
                  {summary.inReviewTasks} tasks
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                  To Do
                </span>
                <span className="font-semibold text-slate-900 font-mono">
                  {summary.todoTasks} tasks
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  Backlog
                </span>
                <span className="font-semibold text-slate-900 font-mono">
                  {summary.backlogTasks} tasks
                </span>
              </div>
            </div>
          </Card>

          {/* Audit / Activity Stream */}
          <Card padding="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">Real-time Team Audit</h3>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                MongoDB Feed
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">Latest actions persisted in database</p>

            {recentActivities.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No activity recorded yet.</p>
            ) : (
              <div className="space-y-3.5">
                {recentActivities.map((act) => (
                  <div key={act._id} className="flex items-start gap-2.5 text-xs">
                    <Avatar
                      name={act.user?.name || 'User'}
                      bg={act.user?.avatarColor || 'bg-brand-600'}
                      size="xs"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 leading-snug">
                        <span className="font-semibold">{act.user?.name || 'User'}</span>{' '}
                        <span className="text-slate-600">{act.details}</span>
                      </p>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        {new Date(act.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
