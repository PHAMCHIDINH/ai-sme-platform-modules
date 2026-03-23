"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../kernel/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-md border-2 border-black text-sm font-bold whitespace-nowrap text-black transition-[background-color,box-shadow,transform] select-none focus-visible:ring-[3px] focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-violet-200 shadow-neo-sm hover:bg-violet-300 hover:shadow-neo-md active:translate-y-[2px] active:shadow-none",
        outline:
          "bg-white shadow-neo-sm hover:bg-yellow-200 hover:shadow-neo-md active:translate-y-[2px] active:shadow-none",
        secondary:
          "bg-cyan-200 shadow-neo-sm hover:bg-cyan-300 hover:shadow-neo-md active:translate-y-[2px] active:shadow-none",
        ghost:
          "border-transparent bg-transparent shadow-none hover:border-black hover:bg-yellow-200 hover:shadow-neo-sm active:translate-y-[2px] active:shadow-none",
        destructive:
          "bg-red-200 shadow-neo-sm hover:bg-red-300 hover:shadow-neo-md active:translate-y-[2px] active:shadow-none",
        link: "!h-auto !border-0 !bg-transparent !px-0 !py-0 !shadow-none text-foreground underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4",
        xs: "h-8 px-3 text-xs",
        sm: "h-9 px-3.5 text-sm",
        lg: "h-12 px-5 text-base",
        icon: "size-10",
        "icon-xs": "size-8",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
