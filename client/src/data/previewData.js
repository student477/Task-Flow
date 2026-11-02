/**
 * PREVIEW DATA ONLY
 * -----------------
 * This file is strictly for UI/UX visual validation during the design review phase.
 * It will NOT be used in production or as a mock replacement for backend APIs.
 * In production phases, all data is loaded dynamically via MERN REST endpoints.
 */

export const PREVIEW_CURRENT_USER = {
  id: 'usr_preview_01',
  name: 'Alex Rivera',
  email: 'alex.rivera@taskflow.dev',
  role: 'Product Lead',
  avatarUrl: null,
  initials: 'AR',
  avatarBg: 'bg-indigo-600',
  currentOrganization: 'Acme SaaS Corp'
};

export const PREVIEW_PROJECTS = [
  {
    id: 'proj_01',
    name: 'TaskFlow Web 2.0',
    key: 'TF',
    description: 'Next-generation project management platform with real-time Kanban & analytics.',
    category: 'Engineering',
    color: '#4f46e5',
    progress: 74,
    totalTasks: 38,
    completedTasks: 28,
    membersCount: 8,
    dueText: 'In 12 days'
  },
  {
    id: 'proj_02',
    name: 'Design System & Token Library',
    key: 'DS',
    description: 'Unified cross-platform UI component library and accessible tokens.',
    category: 'Design',
    color: '#06b6d4',
    progress: 90,
    totalTasks: 20,
    completedTasks: 18,
    membersCount: 4,
    dueText: 'In 4 days'
  },
  {
    id: 'proj_03',
    name: 'Mobile Client (iOS & Android)',
    key: 'MC',
    description: 'Native mobile client companion app for offline task tracking.',
    category: 'Mobile',
    color: '#8b5cf6',
    progress: 42,
    totalTasks: 52,
    completedTasks: 22,
    membersCount: 6,
    dueText: 'In 28 days'
  }
];

export const PREVIEW_METRICS = {
  totalTasks: { count: 110, change: '+14% from last week', trend: 'up' },
  inProgress: { count: 34, label: 'Active in sprint', trend: 'neutral' },
  completed: { count: 68, label: '62% completion rate', trend: 'up' },
  blockedOrOverdue: { count: 4, label: 'Requires immediate attention', trend: 'down' }
};

export const PREVIEW_TASKS = [
  {
    id: 'task_101',
    taskNumber: 'TF-101',
    title: 'Architect JWT refresh token rotation strategy',
    description: 'Implement secure http-only cookie rotation for user session resilience.',
    project: 'TaskFlow Web 2.0',
    status: 'in-progress',
    priority: 'urgent',
    dueDate: 'Today',
    subtasksCompleted: 4,
    subtasksTotal: 5,
    assignee: { name: 'Alex Rivera', initials: 'AR', bg: 'bg-indigo-600' },
    tags: ['Security', 'Backend']
  },
  {
    id: 'task_102',
    taskNumber: 'TF-102',
    title: 'Build drag-and-drop Kanban column virtualization',
    description: 'Optimize high-density task card dragging with smooth micro-animations.',
    project: 'TaskFlow Web 2.0',
    status: 'in-review',
    priority: 'high',
    dueDate: 'Tomorrow',
    subtasksCompleted: 2,
    subtasksTotal: 3,
    assignee: { name: 'Elena Rostova', initials: 'ER', bg: 'bg-emerald-600' },
    tags: ['Frontend', 'Performance']
  },
  {
    id: 'task_103',
    taskNumber: 'TF-103',
    title: 'Create dark mode token palette in Tailwind',
    description: 'Map surface slate scales to semantic theme variables across all modules.',
    project: 'Design System & Token Library',
    status: 'done',
    priority: 'medium',
    dueDate: 'Completed yesterday',
    subtasksCompleted: 6,
    subtasksTotal: 6,
    assignee: { name: 'Marcus Chen', initials: 'MC', bg: 'bg-violet-600' },
    tags: ['UI System']
  },
  {
    id: 'task_104',
    taskNumber: 'TF-104',
    title: 'Audit role-based access control (RBAC) middleware',
    description: 'Ensure granular project permission barriers across team member roles.',
    project: 'TaskFlow Web 2.0',
    status: 'todo',
    priority: 'high',
    dueDate: 'In 3 days',
    subtasksCompleted: 0,
    subtasksTotal: 4,
    assignee: { name: 'Sarah Jenkins', initials: 'SJ', bg: 'bg-amber-600' },
    tags: ['Security', 'Audit']
  },
  {
    id: 'task_105',
    taskNumber: 'TF-105',
    title: 'Configure automated MongoDB index optimizations',
    description: 'Index compound keys for task orderIndex, project membership, and audit trails.',
    project: 'TaskFlow Web 2.0',
    status: 'backlog',
    priority: 'low',
    dueDate: 'Next week',
    subtasksCompleted: 1,
    subtasksTotal: 2,
    assignee: { name: 'Alex Rivera', initials: 'AR', bg: 'bg-indigo-600' },
    tags: ['Database', 'DevOps']
  }
];

export const PREVIEW_ACTIVITIES = [
  {
    id: 'act_01',
    user: 'Elena Rostova',
    initials: 'ER',
    userBg: 'bg-emerald-600',
    action: 'moved task',
    target: 'TF-102 (Kanban virtualization)',
    fromStatus: 'In Progress',
    toStatus: 'In Review',
    timestamp: '12 minutes ago'
  },
  {
    id: 'act_02',
    user: 'Alex Rivera',
    initials: 'AR',
    userBg: 'bg-indigo-600',
    action: 'completed subtask',
    target: 'CSRF protection audit on TF-101',
    timestamp: '45 minutes ago'
  },
  {
    id: 'act_03',
    user: 'Marcus Chen',
    initials: 'MC',
    userBg: 'bg-violet-600',
    action: 'closed task',
    target: 'TF-103 (Dark mode token palette)',
    timestamp: '2 hours ago'
  },
  {
    id: 'act_04',
    user: 'Sarah Jenkins',
    initials: 'SJ',
    userBg: 'bg-amber-600',
    action: 'added comment',
    target: 'TF-104: "Permissions schema is aligned with owner/admin/member specs."',
    timestamp: '4 hours ago'
  }
];
