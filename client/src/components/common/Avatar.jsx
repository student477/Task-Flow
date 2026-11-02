import React from 'react';

const sizeMap = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-7 h-7 text-xs',
  md: 'w-8 h-8 text-xs font-semibold',
  lg: 'w-10 h-10 text-sm font-semibold',
  xl: 'w-12 h-12 text-base font-bold',
};

export default function Avatar({
  name = 'User',
  initials,
  src,
  size = 'md',
  bg = 'bg-brand-600',
  className = '',
  status, // 'online' | 'busy' | 'offline'
}) {
  const displayInitials =
    initials ||
    name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

  return (
    <div className="relative inline-block shrink-0">
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizeMap[size]} rounded-full object-cover ring-2 ring-white ${className}`}
        />
      ) : (
        <div
          title={name}
          className={`${sizeMap[size]} rounded-full ${bg} text-white flex items-center justify-center font-medium ring-2 ring-white shadow-xs select-none ${className}`}
        >
          {displayInitials}
        </div>
      )}
      {status && (
        <span
          className={`absolute bottom-0 right-0 block w-2 h-2 rounded-full ring-2 ring-white ${
            status === 'online'
              ? 'bg-emerald-500'
              : status === 'busy'
              ? 'bg-rose-500'
              : 'bg-slate-400'
          }`}
        />
      )}
    </div>
  );
}
