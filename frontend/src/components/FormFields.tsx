import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export interface FormFieldBaseProps {
  label?: string;
  error?: any;
  registration?: any;
}

export type FormInputProps = FormFieldBaseProps &
  React.InputHTMLAttributes<HTMLInputElement>;

export type FormSelectProps = FormFieldBaseProps &
  React.SelectHTMLAttributes<HTMLSelectElement> & {
    options: { value: string | number; label: string }[];
  };

export type FormTextareaProps = FormFieldBaseProps &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  registration,
  className = '',
  ...props
}) => (
  <div className="space-y-1.5">
    {label && (
      <label className="block text-sm font-semibold text-slate-700">
        {label}
      </label>
    )}
    <input
      {...registration}
      {...props}
      className={`w-full px-4 py-2.5 rounded-xl border bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition ${
        error ? 'border-rose-500' : 'border-slate-300'
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
      <label className="block text-sm font-semibold text-slate-700">
        {label}
      </label>
    )}
    <div className="relative">
      <select
        {...registration}
        {...props}
        className={`w-full appearance-none pl-4 pr-10 py-2.5 rounded-xl border bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition cursor-pointer ${
          error ? 'border-rose-500' : 'border-slate-300'
        } ${className}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-white text-slate-900">
            {opt.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
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
      <label className="block text-sm font-semibold text-slate-700">
        {label}
      </label>
    )}
    <textarea
      {...registration}
      {...props}
      rows={props.rows || 3}
      className={`w-full px-4 py-2.5 rounded-xl border bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition ${
        error ? 'border-rose-500' : 'border-slate-300'
      } ${className}`}
    />
    {error && <p className="text-xs text-rose-500 mt-1">{error.message || error}</p>}
  </div>
);
