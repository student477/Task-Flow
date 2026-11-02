import React from 'react';
import {
  Menu,
  Search,
  Plus,
  HelpCircle,
  Command,
  CheckCircle2
} from 'lucide-react';
import Button from '../common/Button';

export default function Topbar({ onOpenSidebar, pageTitle = 'Dashboard', onNewTask }) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & breadcrumb/title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{pageTitle}</span>
          </h1>
        </div>
      </div>

      {/* Middle: Search bar */}
      <div className="hidden md:flex flex-1 max-w-md items-center">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search tasks, projects, or commands..."
            className="w-full pl-9 pr-16 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 rounded-lg border border-slate-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all placeholder:text-slate-400"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] font-medium text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right: Quick actions */}
      <div className="flex items-center gap-2.5">
        <Button
          size="sm"
          variant="primary"
          icon={Plus}
          onClick={onNewTask}
          className="hidden sm:inline-flex"
        >
          New Task
        </Button>

        {/* Live System Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-semibold text-emerald-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>MongoDB Live</span>
        </div>
      </div>
    </header>
  );
}
