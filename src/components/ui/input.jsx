import { forwardRef } from "react"
import { cn } from "@/lib/utils"

const Input = forwardRef(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-8 w-full rounded-md border border-subtle bg-elevated px-3 py-1 text-xs text-primary placeholder:text-faint focus:border-subtle-hover focus:outline-none transition-colors",
        className
      )}
      {...props}
    />
  )
})

Input.displayName = "Input"
export { Input }