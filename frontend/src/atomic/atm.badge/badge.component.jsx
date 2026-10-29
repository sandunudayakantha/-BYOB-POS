import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-semibold rounded-full tracking-wide';

  const variants = {
    default: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
    primary: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    active: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    success: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40',
    danger: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40',
    info: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border border-stone-200 dark:border-stone-700',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      {...props}
    >
      {children}
    </span>
  );
};
