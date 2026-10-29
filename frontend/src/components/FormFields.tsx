import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export interface FormFieldBaseProps {
  label?: string;
  error?: any;
  registration?: any;
}

export interface FormInputProps
  extends FormFieldBaseProps,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'label'> {}

export interface FormSelectOption {
  value: string | number;
  label: string;
}

export interface FormSelectProps
  extends FormFieldBaseProps,
    Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'label'> {
  options?: FormSelectOption[];
}

export interface FormTextareaProps
  extends FormFieldBaseProps,
    Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'label'> {}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  registration,
  className = '',
  ...props
}) => (
  <div className="space-y-1.5">
    {label && (
      <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300">
        {label}
      </label>
    )}
    <input
      {...registration}
      {...props}
      className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-stone-900/90 text-stone-900 dark:text-white placeholder-stone-500 focus:ring-2 focus:ring-amber-500 focus:outline-none transition ${
        error
          ? 'border-rose-500 dark:border-rose-500'
          : 'border-stone-300 dark:border-stone-700/80'
      } ${className}`}
    />
    {error && <p className="text-xs text-rose-500 mt-1">{error.message || error}</p>}
  </div>
);

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  error,
  options = [],
  registration,
  className = '',
  ...props
}) => (
  <div className="space-y-1.5">
    {label && (
      <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300">
        {label}
      </label>
    )}
    <div className="relative">
      <select
        {...registration}
        {...props}
        className={`w-full appearance-none pl-4 pr-10 py-2.5 rounded-xl border bg-white dark:bg-stone-900/90 text-stone-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none transition cursor-pointer ${
          error
            ? 'border-rose-500 dark:border-rose-500'
            : 'border-stone-300 dark:border-stone-700/80'
        } ${className}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">
            {opt.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400">
        <ChevronDownIcon className="w-4 h-4 stroke-[2]" />
      </div>
    </div>
    {error && <p className="text-xs text-rose-500 mt-1">{error.message || error}</p>}
  </div>
);

export const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  error,
  registration,
  className = '',
  ...props
}) => (
  <div className="space-y-1.5">
    {label && (
      <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300">
        {label}
      </label>
    )}
    <textarea
      {...registration}
      {...props}
      rows={props.rows || 3}
      className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-stone-900/90 text-stone-900 dark:text-white placeholder-stone-500 focus:ring-2 focus:ring-amber-500 focus:outline-none transition ${
        error
          ? 'border-rose-500 dark:border-rose-500'
          : 'border-stone-300 dark:border-stone-700/80'
      } ${className}`}
    />
    {error && <p className="text-xs text-rose-500 mt-1">{error.message || error}</p>}
  </div>
);
