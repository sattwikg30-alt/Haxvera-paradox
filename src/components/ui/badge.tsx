import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] uppercase tracking-wider font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-[#020402]",
        {
          "border-transparent bg-white/10 text-white hover:bg-white/20": variant === "default",
          "border-white/10 bg-transparent text-text-secondary hover:bg-white/5": variant === "secondary",
          "border-transparent bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30": variant === "destructive",
          "border-transparent bg-accent-green/10 text-accent-green hover:bg-accent-green/20 border border-accent-green/20": variant === "success",
          "border-transparent bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 border border-yellow-500/30": variant === "warning",
          "text-white border-white/20": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }