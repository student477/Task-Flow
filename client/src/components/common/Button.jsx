import React from 'react';
import { Loader2 } from 'lucide-react';

const variantClasses = {
  primary: 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-500/20 active:bg-brand-800 border border-transparent',
  secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 active:bg-slate-300 border border-slate-200/60',
  outline: 'bg-transparent hover:bg-slate-100 text-slate-700 border border-slate-300 active:bg-slate-200',
  ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-transparent',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-500/20 active:bg-rose-800 border border-transparent',
};

const sizeClasses = {
  xs: 'px-2 py-1 text-xs gap-1 rounded',
  sm: 'px-3 py-1.5 text-xs font-medium gap-1.5 rounded-md',
  md: 'px-4 py-2 text-sm font-medium gap-2 rounded-lg',
  lg: 'px-5 py-2.5 text-base font-semibold gap-2.5 rounded-lg',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon: Icon,
  className = '',
  disabled = false,
  ...props
}) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:ring-offset-1 select-none disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
}
