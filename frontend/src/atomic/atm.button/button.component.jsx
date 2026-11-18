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
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

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
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm focus:ring-emerald-500 active:scale-95',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 focus:ring-emerald-500 active:scale-95 shadow-sm',
    glass: 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 focus:ring-emerald-500 shadow-sm active:scale-95',
    emerald: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 focus:ring-emerald-500 active:scale-95 font-semibold',
    amber: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 focus:ring-amber-500 active:scale-95 font-semibold',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-sm active:scale-95',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 active:scale-95',
    outline: 'border border-slate-300 hover:bg-slate-50 text-slate-700 active:scale-95',
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
