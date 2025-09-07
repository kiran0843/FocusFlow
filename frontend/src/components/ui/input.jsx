import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

const GlassInput = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-lg border border-white/20 bg-white/10 backdrop-blur-md px-4 py-3 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-focus-500 focus:border-transparent transition-all duration-200",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
GlassInput.displayName = "GlassInput"

export { Input, GlassInput }
