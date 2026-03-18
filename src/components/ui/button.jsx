import { cn } from "@/lib/utils"

export function Button({ className, variant = "default", size = "default", children, ...props }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-mono text-xs font-medium transition-all focus-visible:outline-none disabled:opacity-50 active:scale-[0.98]",
        variant === "default"  && "bg-accent text-base-900 hover:opacity-90",
        variant === "ghost"    && "text-muted hover:bg-base-700 hover:text-accent",
        variant === "outline"  && "border border-subtle text-muted hover:bg-base-700 hover:text-accent",
        variant === "danger"   && "text-muted hover:text-red-400 hover:bg-red-400/10",
        size === "default" && "h-8 px-4",
        size === "sm"      && "h-7 px-3",
        size === "xs"      && "h-6 px-2 text-[10px]",
        size === "icon"    && "h-7 w-7",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
