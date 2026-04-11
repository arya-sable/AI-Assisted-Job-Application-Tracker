import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-teal-400 dark:focus:ring-teal-400/15 ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10 dark:border-red-500'
              : 'border-slate-200 dark:border-slate-600'
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
