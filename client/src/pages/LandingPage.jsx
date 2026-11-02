import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  ArrowRight,
  Kanban,
  ShieldCheck,
  Zap,
  BarChart2,
  Users,
  CheckCircle2,
  Clock,
  ChevronRight
} from 'lucide-react';
import Button from '../components/common/Button';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Top Navbar */}
      <header className="h-20 border-b border-slate-800/90 px-6 lg:px-12 flex items-center justify-between max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
            <Layers className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            TaskFlow
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <a href="#workflow" className="hover:text-white transition-colors">
            Workflow
          </a>
          <a href="#security" className="hover:text-white transition-colors">
            Security
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/login')}
            className="text-slate-300 hover:text-white hover:bg-slate-800"
          >
            Sign in
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/register')}
          >
            Get Started Free
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 lg:px-12 max-w-5xl mx-auto text-center flex-1 flex flex-col items-center justify-center">
        {/* Release Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-8 animate-in fade-in">
          <span className="flex h-2 w-2 rounded-full bg-brand-400 animate-pulse" />
          TaskFlow SaaS 2.0 Engine is Live
          <ChevronRight className="w-3.5 h-3.5 ml-0.5 text-brand-400" />
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.15] mb-6">
          High-velocity project management for{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-300 to-sky-400">
            modern product teams.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed mb-10">
          Streamline your sprints, assign responsibilities, and ship features faster with a precision-engineered MERN stack workflow.
        </p>

        {/* CTA Group */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <Button
            size="lg"
            variant="primary"
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto text-base px-8 py-3.5 shadow-lg shadow-brand-500/25"
          >
            Launch Interactive Workspace <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto text-base px-8 py-3.5 bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700"
          >
            View Demo Login
          </Button>
        </div>

        {/* App Showcase Mockup Card */}
        <div className="mt-16 w-full rounded-2xl border border-slate-800/90 bg-slate-950/70 p-3 shadow-2xl shadow-brand-500/10 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/60 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-slate-400">taskflow.app/workspace/TF</span>
            </div>
            <div className="font-semibold text-brand-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Sprint Sprint-14 Active
            </div>
          </div>
          {/* Simulated App Snapshot */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                <span>In Progress (12)</span>
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
              </div>
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60 mb-2">
                <span className="text-[10px] font-bold text-brand-300 font-mono">TF-101</span>
                <p className="text-xs font-semibold text-white mt-1">JWT refresh token rotation strategy</p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-medium">Urgent</span>
                  <span>Due Today</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <span className="text-[10px] font-bold text-brand-300 font-mono">TF-102</span>
                <p className="text-xs font-semibold text-white mt-1">Kanban virtualized drag & drop</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                <span>In Review (8)</span>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              </div>
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <span className="text-[10px] font-bold text-brand-300 font-mono">TF-98</span>
                <p className="text-xs font-semibold text-white mt-1">Granular RBAC middleware audit</p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium">High</span>
                  <span>Reviewed</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                <span>Completed (24)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60 opacity-80">
                <span className="text-[10px] font-bold text-emerald-400 font-mono">TF-94</span>
                <p className="text-xs font-semibold text-slate-200 mt-1 line-through">Tailwind design token library</p>
                <div className="mt-2 text-[11px] text-emerald-400">✓ 6/6 Subtasks done</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section id="features" className="py-20 bg-slate-950 border-t border-slate-800/80 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-2">
              Architecture & Capabilities
            </h2>
            <h3 className="text-3xl font-extrabold text-white">
              Built for speed, reliability, and precision
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center mb-4">
                <Kanban className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Dynamic Kanban Board</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Organize work with multi-column boards, priority tags, subtask checklists, and custom workflow stages.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <BarChart2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Real-Time Metrics</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Zero fake metrics. Automatic calculation of sprint velocity, overdue items, and team workload distribution.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Hardened Security</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                JWT token authentication, bcrypt password hashing, and strict backend authorization checking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-6 text-center text-xs text-slate-500">
        <p>© 2026 TaskFlow. Professional MERN Stack Project Management.</p>
      </footer>
    </div>
  );
}
