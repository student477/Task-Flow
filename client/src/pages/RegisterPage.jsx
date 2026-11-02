import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layers, Mail, Lock, User, Building, ArrowRight, Check, AlertCircle } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, authError, setAuthError } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setIsLoading(true);

    const result = await register(formData);
    setIsLoading(false);

    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setLocalError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-brand-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
            <Layers className="w-6 h-6" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-white">
            TaskFlow
          </span>
        </Link>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">
          Create your workspace
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Get started with your team's high-velocity project management system
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          {(localError || authError) && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{localError || authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                label="Full Name"
                icon={User}
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  setLocalError('');
                }}
                placeholder="Alex Rivera"
                required
                className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-brand-500"
              />
            </div>

            <div>
              <Input
                label="Work Email"
                type="email"
                icon={Mail}
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setLocalError('');
                }}
                placeholder="alex.rivera@company.com"
                required
                className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-brand-500"
              />
            </div>

            <div>
              <Input
                label="Workspace / Organization"
                icon={Building}
                value={formData.organization}
                onChange={(e) => {
                  setFormData({ ...formData, organization: e.target.value });
                  setLocalError('');
                }}
                placeholder="Acme Product Engineering"
                className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-brand-500"
              />
            </div>

            <div>
              <Input
                label="Master Password"
                type="password"
                icon={Lock}
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setLocalError('');
                }}
                placeholder="••••••••••••"
                required
                className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-brand-500"
              />
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                <Check className="w-3.5 h-3.5 text-brand-400" />
                <span>Minimum 6 characters required</span>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-4 font-semibold shadow-md shadow-brand-500/30"
            >
              Initialize Workspace <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-brand-400 hover:text-brand-300 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
