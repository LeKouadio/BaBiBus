import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Eye, EyeOff } from 'lucide-react';

interface InputProps {
  label: string;
  type?: 'text' | 'email' | 'password' | 'number';
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  error?: string;
  success?: boolean;
  placeholder?: string;
}

export const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  icon,
  error,
  success,
  placeholder
}: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const hasValue = value.length > 0;
  const isPassword = type === 'password';

  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="relative w-full">
      <div className="relative">
        <motion.input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isFocused || hasValue ? '' : placeholder}
          className={`
            w-full h-[56px] rounded-[16px] px-4 bg-input-background transition-all duration-200 text-foreground
            ${icon ? 'pl-12' : ''}
            ${isPassword ? 'pr-12' : success ? 'pr-12' : ''}
            ${error
              ? 'border-[1.5px] border-[#C62828]'
              : isFocused
                ? 'border-[1.5px] border-[#F57C00]'
                : 'border border-border'
            }
          `}
        />

        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2E7D32]">
            {icon}
          </div>
        )}

        <AnimatePresence>
          {(isFocused || hasValue) && (
            <motion.label
              initial={{ y: 18, fontSize: '16px' }}
              animate={{ y: -28, fontSize: '12px' }}
              exit={{ y: 18, fontSize: '16px' }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={`
                absolute left-4 pointer-events-none font-medium
                ${error ? 'text-[#C62828]' : 'text-muted-foreground'}
              `}
            >
              {label}
            </motion.label>
          )}
        </AnimatePresence>

        {!isFocused && !hasValue && (
          <label className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {label}
          </label>
        )}

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2E7D32]"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}

        {success && !error && hasValue && !isPassword && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.15 }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2E7D32]"
          >
            <Check className="w-5 h-5" />
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="text-[#C62828] text-[12px] mt-1 ml-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};
