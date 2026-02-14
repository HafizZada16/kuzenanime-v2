import React from 'react';
import { triggerHaptic } from '../utils/haptics';

const Button = ({ children, variant = 'primary', className = '', onClick }: { children: React.ReactNode, variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost', className?: string, onClick?: () => void }) => {
  const handleClick = (e: React.MouseEvent) => {
    triggerHaptic(15);
    if (onClick) onClick();
  };

  const variants = {
    primary: 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] shadow-lg shadow-violet-500/20',
    secondary: 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm',
    accent: 'bg-[var(--accent)] text-white hover:brightness-110 shadow-lg shadow-cyan-500/20',
    outline: 'bg-transparent border border-white/20 text-white hover:bg-white/5',
    ghost: 'bg-transparent text-white hover:bg-white/5',
  };

  return (
    <button
      onClick={handleClick}
      className={`px-6 py-2.5 font-medium rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer text-sm ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
