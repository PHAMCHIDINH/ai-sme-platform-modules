import * as React from "react"

import { cn } from "../kernel/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full !rounded-md !border-2 !border-black bg-white px-3 py-2 text-sm font-medium text-foreground transition-[background-color,box-shadow,transform] outline-none placeholder:text-muted-foreground focus-visible:bg-cyan-200 focus-visible:shadow-neo-sm disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60 aria-invalid:bg-red-200",
        className
      )}
      {...props}
    />
  )
})

Textarea.displayName = "Textarea"

export { Textarea }
