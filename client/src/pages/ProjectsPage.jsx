import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Users,
  FolderKanban,
  ArrowRight,
  MoreVertical,
  Settings,
  Trash2,
  UserPlus,
  Shield,
  Loader2,
  AlertCircle,
  FolderPlus
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import Avatar from '../components/common/Avatar';
import { projectService } from '../services/projectService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const COLOR_OPTIONS = [
  '#4f46e5', // Indigo
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#f43f5e', // Rose
];

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [activeProject, setActiveProject] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
    category: 'Engineering',
    color: '#4f46e5'
  });
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('member');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  // Fetch real projects from backend
  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await projectService.getProjects();
      setProjects(res.data?.projects || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch projects from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Handle Create Project
  const handleCreateProject = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError('');

    try {
      const res = await projectService.createProject(formData);
      setCreateModalOpen(false);
      setFormData({
        name: '',
        key: '',
        description: '',
        category: 'Engineering',
        color: '#4f46e5'
      });
      await loadProjects();
      window.dispatchEvent(new Event('taskflow_project_updated'));
      toast.success('Initiative created successfully in MongoDB!');
    } catch (err) {
      setActionError(err.message || 'Error creating project');
      toast.error(err.message || 'Error creating project');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Project
  const handleDeleteProject = async (projectId, projectName) => {
    if (!window.confirm(`Are you sure you want to delete "${projectName}"? All tasks and activities will be permanently deleted.`)) {
      return;
    }
    try {
      await projectService.deleteProject(projectId);
      await loadProjects();
      window.dispatchEvent(new Event('taskflow_project_updated'));
      toast.success(`Project "${projectName}" deleted.`);
    } catch (err) {
      toast.error(`Delete failed: ${err.message}`);
    }
  };

  // Handle Add Member
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail) return;
    setActionLoading(true);
    setActionError('');

    try {
      await projectService.addMember(activeProject._id, {
        email: memberEmail,
        role: memberRole
      });
      setMemberEmail('');
      const updated = await projectService.getProjectById(activeProject._id);
      setActiveProject(updated.data.project);
      await loadProjects();
      toast.success('Team member added to project!');
    } catch (err) {
      setActionError(err.message || 'Failed to add member');
      toast.error(err.message || 'Failed to add member');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Remove Member
  const handleRemoveMember = async (memberUserId) => {
    if (!window.confirm('Remove this member from the project?')) return;
    try {
      await projectService.removeMember(activeProject._id, memberUserId);
      const updated = await projectService.getProjectById(activeProject._id);
      setActiveProject(updated.data.project);
      await loadProjects();
      toast.info('Member removed from project.');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Projects Workspace
          </h2>
          <p className="text-sm text-slate-500">
            Real MongoDB initiatives with sprint analytics and role-based access.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => {
            setActionError('');
            setCreateModalOpen(true);
          }}
        >
          New Project
        </Button>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadProjects}
            className="text-xs font-semibold underline text-rose-800"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-6 bg-white rounded-xl border border-slate-200/80 animate-pulse space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="w-12 h-6 bg-slate-200 rounded" />
                <div className="w-16 h-5 bg-slate-200 rounded-full" />
              </div>
              <div className="w-3/4 h-5 bg-slate-200 rounded" />
              <div className="w-full h-10 bg-slate-100 rounded" />
              <div className="w-full h-2 bg-slate-200 rounded-full" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        /* Empty State */
        <Card padding="p-12" className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4 border border-brand-100">
            <FolderPlus className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Projects Found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6">
            Get started by creating your first project initiative to manage tasks and team members.
          </p>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setCreateModalOpen(true)}
          >
            Create Your First Project
          </Button>
        </Card>
      ) : (
        /* Real Projects Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => {
            const isOwner = project.owner?._id === user?._id || project.owner === user?._id;

            return (
              <Card
                key={project._id}
                hoverEffect
                className="flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider text-white shadow-xs"
                      style={{ backgroundColor: project.color || '#4f46e5' }}
                    >
                      {project.key}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        {project.category || 'General'}
                      </span>
                      {isOwner && (
                        <button
                          title="Delete Project"
                          onClick={() => handleDeleteProject(project._id, project.name)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3
                    onClick={() => navigate(`/board?project=${project._id}`)}
                    className="text-base font-bold text-slate-900 hover:text-brand-600 transition-colors cursor-pointer"
                  >
                    {project.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                    {project.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-600">Sprint Progress</span>
                    <span className="text-slate-900 font-mono">
                      {project.progress}% ({project.completedTasks || 0}/{project.totalTasks || 0} tasks)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${project.progress || 0}%`,
                        backgroundColor: project.color || '#4f46e5'
                      }}
                    />
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <button
                      onClick={() => {
                        setActiveProject(project);
                        setMembersModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 hover:text-brand-600 transition-colors font-medium"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>{project.members?.length || 1} members</span>
                    </button>
                    <button
                      onClick={() => navigate(`/board?project=${project._id}`)}
                      className="flex items-center gap-1 text-brand-600 font-semibold hover:text-brand-700 transition-colors"
                    >
                      <span>Open Kanban</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Initiative"
        subtitle="Initialize a project workspace with a unique prefix key"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          {actionError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{actionError}</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Input
                label="Project Name"
                placeholder="e.g. NextGen Microservices"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Input
                label="Key Prefix"
                placeholder="e.g. NGM"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase() })}
                required
                maxLength={8}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
              placeholder="Outline project objectives and sprint targets..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                className="w-full text-xs rounded-lg border border-slate-300 p-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Product">Product</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Project Accent
              </label>
              <div className="flex items-center gap-2 pt-1">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: c })}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      formData.color === c ? 'ring-2 ring-offset-2 ring-brand-500 scale-110' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

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
              isLoading={actionLoading}
            >
              Create Initiative
            </Button>
          </div>
        </form>
      </Modal>

      {/* MEMBERS MANAGEMENT MODAL */}
      <Modal
        isOpen={membersModalOpen}
        onClose={() => setMembersModalOpen(false)}
        title={`Team Members — ${activeProject?.name || ''}`}
        subtitle="Manage access roles and assign team collaborators"
      >
        <div className="space-y-5">
          {/* Add member form */}
          <form onSubmit={handleAddMember} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-brand-600" />
              <span>Invite Member</span>
            </div>
            {actionError && (
              <p className="text-xs text-rose-600 mb-2 font-medium">{actionError}</p>
            )}
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="colleague@taskflow.dev"
                required
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
              <select
                value={memberRole}
                onChange={(e) => setMemberRole(e.target.value)}
                className="text-xs px-2 py-1.5 rounded-lg border border-slate-300"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={actionLoading}
              >
                Invite
              </Button>
            </div>
          </form>

          {/* Members List */}
          <div>
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Current Roster ({activeProject?.members?.length || 0})
            </div>
            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {activeProject?.members?.map((member) => {
                const memberUser = member.user || {};
                const isMemberOwner = member.role === 'owner' || activeProject.owner?._id === memberUser._id;

                return (
                  <div
                    key={memberUser._id || Math.random()}
                    className="py-2.5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        name={memberUser.name || 'User'}
                        bg={memberUser.avatarColor || 'bg-brand-600'}
                        size="xs"
                      />
                      <div>
                        <div className="font-semibold text-slate-800">
                          {memberUser.name || 'Unknown User'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {memberUser.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                        {member.role}
                      </span>
                      {!isMemberOwner && (
                        <button
                          onClick={() => handleRemoveMember(memberUser._id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="Remove member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
