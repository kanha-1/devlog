import { cn } from "@/lib/utils"

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        "h-8 rounded-md border border-subtle bg-base-700 px-2 text-xs text-muted focus:border-border-hover focus:outline-none transition-colors cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}
