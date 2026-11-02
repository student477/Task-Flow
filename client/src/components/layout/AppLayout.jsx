import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { projectService } from '../../services/projectService';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Load user's real projects
  useEffect(() => {
    let isMounted = true;
    const fetchProjects = async () => {
      try {
        const response = await projectService.getProjects();
        if (isMounted && response?.data?.projects) {
          setProjects(response.data.projects);
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
      }
    };
    fetchProjects();

    const handleProjectCreated = () => fetchProjects();
    window.addEventListener('taskflow_project_updated', handleProjectCreated);

    return () => {
      isMounted = false;
      window.removeEventListener('taskflow_project_updated', handleProjectCreated);
    };
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Overview Dashboard';
    if (path.includes('projects')) return 'Projects Workspace';
    if (path.includes('board')) return 'Kanban Sprint Board';
    return 'TaskFlow Workspace';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        projects={projects}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <Topbar
          onOpenSidebar={() => setSidebarOpen(true)}
          pageTitle={getPageTitle()}
          onNewTask={() => {
            if (projects.length > 0) {
              navigate(`/board?project=${projects[0]._id}&create=true`);
            } else {
              navigate('/projects');
            }
          }}
        />

        {/* Dynamic Outlet / Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ projects, refreshProjects: () => window.dispatchEvent(new Event('taskflow_project_updated')) }} />
        </main>
      </div>
    </div>
  );
}
