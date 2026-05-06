import React from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline-green' | 'outline-orange' | 'danger';
  children: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit';
  icon?: React.ReactNode;
  className?: string;
}

export const Button = ({
  variant = 'primary',
  children,
  onClick,
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  icon,
  className = ''
}: ButtonProps) => {
  const baseStyles = 'h-[52px] rounded-[50px] font-semibold transition-all duration-150 flex items-center justify-center gap-2';

  const variantStyles = {
    primary: 'bg-[#F57C00] text-white shadow-[0_4px_16px_rgba(245,124,0,0.30)] hover:bg-[#E65100] active:scale-[0.97]',
    secondary: 'bg-[#2E7D32] text-white shadow-[0_4px_16px_rgba(46,125,50,0.30)] hover:bg-[#1B5E20] active:scale-[0.97]',
    'outline-green': 'bg-card text-[#2E7D32] border-[1.5px] border-[#2E7D32] hover:bg-[#E8F5E9] active:scale-[0.97]',
    'outline-orange': 'bg-card text-[#F57C00] border-[1.5px] border-[#F57C00] hover:bg-[#FFF3E0] active:scale-[0.97]',
    danger: 'bg-[#C62828] text-white hover:bg-[#B71C1C] active:scale-[0.97]'
  };

  const disabledStyles = 'opacity-50 cursor-not-allowed';

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? disabledStyles : ''}
        ${className}
      `}
      whileTap={!disabled && !loading ? { scale: 0.97 } : {}}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          {icon && <span className="w-5 h-5">{icon}</span>}
          {children}
        </>
      )}
    </motion.button>
  );
};
