import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "../kernel/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <InputPrimitive
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          "h-10 w-full min-w-0 !rounded-md !border-2 !border-black bg-white px-3 py-2 text-sm font-medium text-foreground transition-[background-color,box-shadow,transform] outline-none placeholder:text-muted-foreground focus-visible:bg-cyan-200 focus-visible:shadow-neo-sm disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60 aria-invalid:bg-red-200",
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }
