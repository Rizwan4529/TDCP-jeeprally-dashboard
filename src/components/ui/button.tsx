import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "rounded-full bg-primary text-primary-foreground shadow-[0_10px_22px_rgba(91,52,17,0.22)] hover:bg-primary-dark",
        "primary-outline":
          "rounded-full border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground",
        outline:
          "rounded-full border-border bg-background shadow-xs hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "rounded-full border border-primary/15 bg-secondary text-secondary-foreground shadow-[0_8px_18px_rgba(249,218,74,0.28)] hover:brightness-95 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "rounded-full hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        "destructive-outline":
          "rounded-full border-destructive bg-background text-destructive hover:bg-destructive/10 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:border-destructive/60 dark:bg-background dark:hover:bg-destructive/15 dark:focus-visible:ring-destructive/40",
        link: "rounded-full text-primary underline-offset-4 hover:text-primary-dark hover:underline",
      },
      size: {
        default: "h-11 gap-2 px-6 text-[15px] font-medium has-[>svg]:px-4",
        xs: "h-7 gap-1 rounded-full px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-full px-3 text-sm has-[>svg]:px-2.5",
        lg: "h-11 gap-2 px-6 text-[15px] font-medium has-[>svg]:px-4",
        xl: "h-12 gap-2 px-6 text-[15px] font-medium has-[>svg]:px-4",
        icon: "size-11 rounded-full",
        "icon-xs": "size-6 rounded-full [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-full [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-11 rounded-full",
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
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

/* eslint-disable react-refresh/only-export-components -- consumers import buttonVariants */
export { Button, buttonVariants }
