import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: ReactNode;
}

const variants = {
  primary:
    'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-500/25 hover:from-teal-500 hover:to-emerald-500 hover:shadow-teal-500/40 focus:ring-teal-400/50 dark:from-teal-500 dark:to-emerald-500 dark:shadow-teal-500/20 dark:hover:from-teal-400 dark:hover:to-emerald-400',
  secondary:
    'border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-300/50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:border-slate-500 dark:focus:ring-slate-500/50',
  danger:
    'bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-lg shadow-rose-500/25 hover:from-rose-600 hover:to-red-600 focus:ring-rose-400/50 dark:shadow-rose-500/20',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-300/50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 dark:focus:ring-slate-600/50',
};

const sizes = {
  sm: 'px-3 py-1.5 text-[13px]',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:active:scale-100 dark:focus:ring-offset-slate-900 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
