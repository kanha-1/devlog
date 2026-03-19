import { cn } from "@/lib/utils"

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "flex h-8 w-full rounded-md border border-subtle bg-elevated px-3 py-1 text-xs text-primary placeholder:text-faint focus:border-subtle-hover focus:outline-none transition-colors",
        className
      )}
      {...props}
    />
  )
}
