import React, { createContext, useContext, useRef } from 'react';

const FormContext = createContext(null);

export function Form({
  children,
  onSubmit,
  className = 'space-y-4',
  ...props
}) {
  const fieldGetters = useRef(new Map());

  const registerField = (name, getValue) => {
    fieldGetters.current.set(name, getValue);
  };

  const unregisterField = (name) => {
    fieldGetters.current.delete(name);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const values = {};
    for (const [name, getter] of fieldGetters.current.entries()) {
      values[name] = getter();
    }
    if (onSubmit) {
      onSubmit(values);
    }
  };

  return (
    <FormContext.Provider value={{ registerField, unregisterField }}>
      <form onSubmit={handleSubmit} className={className} {...props}>
        {children}
      </form>
    </FormContext.Provider>
  );
}

export function FormFields({ children, className = 'space-y-4' }) {
  return <div className={className}>{children}</div>;
}

export function FormField({
  name,
  label,
  defaultValue = '',
  type = 'text',
  required = false,
  placeholder = '',
  className = '',
  error = null,
}) {
  const ctx = useContext(FormContext);
  const inputRef = useRef(null);

  React.useEffect(() => {
    if (!ctx) return;
    ctx.registerField(name, () => inputRef.current?.value ?? '');
    return () => ctx.unregisterField(name);
  }, [ctx, name]);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <input
        ref={inputRef}
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className={`w-full px-3.5 py-2.5 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition ${
          error
            ? 'border-rose-500 focus:ring-rose-500'
            : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-500'
        }`}
      />
      {error && <p className="text-xs text-rose-500 mt-0.5">{error}</p>}
    </div>
  );
}

Form.Fields = FormFields;
Form.Field = FormField;
