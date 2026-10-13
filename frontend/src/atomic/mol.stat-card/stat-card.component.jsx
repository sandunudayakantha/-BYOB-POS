import React from 'react';
import { Link } from 'react-router-dom';

export const StatCard = ({
  name,
  value,
  icon: Icon,
  link,
  color = 'from-emerald-500 to-teal-600',
  description,
}) => {
  const content = (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-sm hover:shadow-md transition group">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          {name}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color} text-white shadow-sm`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {value ?? 0}
        </span>
      </div>
      {description && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
    </div>
  );

  if (link) {
    return <Link to={link}>{content}</Link>;
  }

  return content;
};
