import React from 'react';

const statusStyles = {
  backlog: 'bg-slate-100 text-slate-700 border-slate-200/80',
  todo: 'bg-blue-50 text-blue-700 border-blue-200/80',
  'in-progress': 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
  'in-review': 'bg-amber-50 text-amber-700 border-amber-200/80',
  done: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
};

const priorityStyles = {
  low: 'bg-slate-100 text-slate-600 border-slate-200/80',
  medium: 'bg-sky-50 text-sky-700 border-sky-200/80',
  high: 'bg-amber-50 text-amber-700 border-amber-200/80',
  urgent: 'bg-rose-50 text-rose-700 border-rose-200/80 font-semibold',
};

const dotColors = {
  low: 'bg-slate-400',
  medium: 'bg-sky-500',
  high: 'bg-amber-500',
  urgent: 'bg-rose-500 animate-pulse',
  backlog: 'bg-slate-400',
  todo: 'bg-blue-500',
  'in-progress': 'bg-indigo-500',
  'in-review': 'bg-amber-500',
  done: 'bg-emerald-500',
};

export default function Badge({
  children,
  type = 'default', // 'status' | 'priority' | 'default'
  value = '',
  withDot = true,
  className = '',
}) {
  const normalizedValue = String(value).toLowerCase().replace(/\s+/g, '-');
  
  let style = 'bg-slate-100 text-slate-700 border-slate-200/80';
  let dotColor = 'bg-slate-400';

  if (type === 'status' && statusStyles[normalizedValue]) {
    style = statusStyles[normalizedValue];
    dotColor = dotColors[normalizedValue] || dotColor;
  } else if (type === 'priority' && priorityStyles[normalizedValue]) {
    style = priorityStyles[normalizedValue];
    dotColor = dotColors[normalizedValue] || dotColor;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} ${className}`}
    >
      {withDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />}
      {children || value}
    </span>
  );
}
