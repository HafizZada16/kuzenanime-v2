import React from 'react';
import { triggerHaptic } from '../utils/haptics';

const Button = ({ children, variant = 'yellow', className = '', onClick }: { children: React.ReactNode, variant?: 'yellow' | 'coral' | 'purple' | 'mint' | 'black' | 'white', className?: string, onClick?: () => void }) => {
  const handleClick = (e: React.MouseEvent) => {
    triggerHaptic(15);
    if (onClick) onClick();
  };

  const variants = {
    yellow: 'bg-[var(--neo-yellow)] text-black hover:brightness-110',
    coral: 'bg-[var(--neo-coral)] text-white hover:brightness-110',
    purple: 'bg-[var(--neo-purple)] text-white hover:brightness-110',
    mint: 'bg-[var(--neo-mint)] text-black hover:brightness-110',
    black: 'bg-black text-white hover:bg-[#222]',
    white: 'bg-white text-black hover:bg-gray-100',
  };

  return (
    <button
      onClick={handleClick}
      className={`px-6 py-3 font-normal heading-font text-sm tracking-tighter uppercase border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all duration-75 cursor-pointer ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
