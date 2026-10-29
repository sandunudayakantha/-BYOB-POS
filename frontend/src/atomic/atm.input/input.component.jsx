import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Input = React.forwardRef(({
  className = '',
  hasError = false,
  type = 'text',
  ...props
}, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className={twMerge(
        clsx(
          'w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition',
          hasError
            ? 'border-rose-500 focus:ring-rose-500'
            : 'border-slate-300 dark:border-slate-700 focus:ring-amber-500 focus:border-amber-500',
          className
        )
      )}
      {...props}
    />
  );
});

Input.displayName = 'Input';
