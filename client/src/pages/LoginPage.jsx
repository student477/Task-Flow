import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Layers, Mail, Lock, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, authError, setAuthError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setIsLoading(true);

    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setLocalError(result.message);
    }
  };

  const handleFillDemo = () => {
    // Fill sample credentials
    setEmail('lead@taskflow.dev');
    setPassword('Password123!');
    setLocalError('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-brand-500 selection:text-white">
      {/* Brand Header */}
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
          Sign in to your workspace
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Enter your credentials to access your projects and tasks
        </p>
      </div>

      {/* Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          {/* Demo account quick pill */}
          <div className="mb-6 p-3 rounded-xl bg-brand-950/60 border border-brand-500/30 text-brand-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-400 shrink-0" />
              <span>Testing? Autofill demo credentials.</span>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-[11px] font-semibold text-brand-300 hover:text-white underline cursor-pointer"
            >
              Autofill
            </button>
          </div>

          {(localError || authError) && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{localError || authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                label="Work Email"
                type="email"
                icon={Mail}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setLocalError('');
                }}
                placeholder="name@company.com"
                required
                className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-brand-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <Input
                type="password"
                icon={Lock}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setLocalError('');
                }}
                placeholder="••••••••••••"
                required
                className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:border-brand-500"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-4 font-semibold shadow-md shadow-brand-500/30"
            >
              Sign In to TaskFlow <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="font-semibold text-brand-400 hover:text-brand-300 transition-colors"
            >
              Create workspace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
