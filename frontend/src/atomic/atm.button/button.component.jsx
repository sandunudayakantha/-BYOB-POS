import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  rounded = 'full',
  className = '',
  disabled = false,
  isLoading = false,
  type = 'button',
  as: Component = 'button',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const roundness = {
    full: 'rounded-full',
    pill: 'rounded-full',
    xl: 'rounded-2xl',
    lg: 'rounded-xl',
    md: 'rounded-lg',
    sm: 'rounded-md',
    none: 'rounded-none',
  };

  const variants = {
    primary: 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold focus:ring-amber-500 active:scale-95',
    secondary: 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800/80 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-100 border border-stone-200 dark:border-stone-700/60 focus:ring-amber-500 active:scale-95',
    glass: 'bg-white/10 dark:bg-stone-800/60 hover:bg-white/20 dark:hover:bg-stone-800 text-stone-900 dark:text-white border border-stone-200/60 dark:border-white/15 backdrop-blur-md focus:ring-amber-500 shadow-sm active:scale-95',
    amber: 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/25 focus:ring-amber-500 active:scale-95 font-semibold',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-sm active:scale-95',
    ghost: 'bg-transparent hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 active:scale-95',
    outline: 'border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 active:scale-95',
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5',
  };

  const resolvedRound = roundness[rounded] || roundness.full;

  return (
    <Component
      type={Component === 'button' ? type : undefined}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={twMerge(clsx(baseStyles, resolvedRound, variants[variant], sizes[size], className))}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </Component>
  );
};
