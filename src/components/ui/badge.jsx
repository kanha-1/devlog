import { cn } from "@/lib/utils"

export function Badge({ className, children, ...props }) {
  return (
    <span className={cn("inline-flex items-center rounded px-2 py-0.5 text-[10px] font-medium", className)} {...props}>
      {children}
    </span>
  )
}
