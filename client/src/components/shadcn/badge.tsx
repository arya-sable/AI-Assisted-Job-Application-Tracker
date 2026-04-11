import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900",
  {
    variants: {
      variant: {
        default:
          "bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900",
        secondary:
          "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50",
        destructive:
          "bg-red-500 text-white dark:bg-red-600",
        outline:
          "border border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface ShadBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function ShadBadge({ className, variant, ...props }: ShadBadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { ShadBadge }
