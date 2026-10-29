import React from 'react';

const Badge = ({ variant = 'default', children, className = '' }) => {
  const variantStyles = {
    active: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25',
    suspended: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800/60',
    inactive: 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 border-stone-200 dark:border-stone-700',
    info: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border-stone-200 dark:border-stone-700',
    default: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border-stone-200 dark:border-stone-700'
  };

  const style = variantStyles[variant.toLowerCase()] || variantStyles.default;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
