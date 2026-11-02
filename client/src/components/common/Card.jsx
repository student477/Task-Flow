import React from 'react';

export default function Card({
  children,
  className = '',
  hoverEffect = false,
  padding = 'p-5',
  ...props
}) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/90 shadow-card transition-all duration-200 ${
        hoverEffect ? 'hover:shadow-elevated hover:border-slate-300 -translate-y-0.5' : ''
      } ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
