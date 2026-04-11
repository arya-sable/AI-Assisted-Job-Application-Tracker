import * as React from "react"
import { cn } from "@/lib/utils"

export interface ShadInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

const ShadInput = React.forwardRef<HTMLInputElement, ShadInputProps>(
  ({ className, type, label, error, icon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-")
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-slate-900 dark:text-slate-200"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
              {icon}
            </div>
          )}
          <input
            type={type}
            id={inputId}
            className={cn(
              "flex h-11 w-full rounded-xl border bg-white px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus-visible:ring-slate-500",
              error
                ? "border-red-400 focus-visible:ring-red-400 dark:border-red-500"
                : "border-slate-200 dark:border-slate-700",
              icon ? "pl-10" : "",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
      </div>
    )
  }
)
ShadInput.displayName = "ShadInput"

export { ShadInput }
