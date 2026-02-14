import React from 'react';

const Badge = ({ children, color = 'primary', className = '' }: { children: React.ReactNode, color?: string, className?: string }) => {
  const colors: Record<string, string> = {
    primary: 'bg-[var(--primary)] text-white border-none',
    accent: 'bg-yellow-500 text-black border-none',
    green: 'bg-emerald-500 text-white border-none',
    red: 'bg-rose-500 text-white border-none',
    gray: 'bg-white/20 text-white border-none',
  };
  return (
    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-sm ${colors[color] || colors.primary} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
