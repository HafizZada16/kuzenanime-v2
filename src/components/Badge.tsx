import React from 'react';

const Badge = ({ children, color = 'yellow', className = '' }: { children: React.ReactNode, color?: string, className?: string }) => {
  const colors: Record<string, string> = {
    yellow: 'bg-[var(--neo-yellow)] text-black',
    coral: 'bg-[var(--neo-coral)] text-white',
    purple: 'bg-[var(--neo-purple)] text-white',
    mint: 'bg-[var(--neo-mint)] text-black',
    black: 'bg-black text-white',
  };
  return (
    <span className={`px-2 py-0.5 text-[10px] font-bold border-2 border-black uppercase mono ${colors[color] || colors.yellow} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
