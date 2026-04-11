import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`group relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white/90 text-slate-500 backdrop-blur transition-all duration-300 hover:border-slate-300 hover:text-amber-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-cyan-400 ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Sun */}
      <svg
        className={`absolute h-[18px] w-[18px] transition-all duration-500 ${isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>

      {/* Moon */}
      <svg
        className={`absolute h-[18px] w-[18px] transition-all duration-500 ${isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  );
}
