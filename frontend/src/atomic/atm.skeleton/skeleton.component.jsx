import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Skeleton = ({
  className = '',
  variant = 'rectangular',
  ...props
}) => {
  const base = 'animate-pulse bg-slate-200 dark:bg-slate-700/60';
  const variants = {
    rectangular: 'rounded-xl',
    circular: 'rounded-full',
    text: 'rounded h-4 w-full',
  };

  return (
    <div
      className={twMerge(clsx(base, variants[variant], className))}
      {...props}
    />
  );
};
