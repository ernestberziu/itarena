import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer select-none transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out motion-safe:active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:active:scale-100 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border-2 border-primary/80 shadow-lg shadow-primary/25 hover:bg-primary/88 hover:border-primary hover:shadow-xl hover:shadow-primary/30 active:bg-primary/95 active:shadow-md active:shadow-primary/20",
        destructive:
          "bg-destructive text-destructive-foreground border-2 border-destructive/80 shadow-lg shadow-destructive/20 hover:bg-destructive/88 hover:border-destructive hover:shadow-xl hover:shadow-destructive/25 active:bg-destructive active:shadow-md",
        /** Solid slate — not white */
        outline:
          "rounded-xl border-2 border-slate-500 bg-slate-300 text-slate-950 shadow-sm hover:bg-slate-400 hover:border-slate-600 hover:shadow-md active:bg-slate-500 active:border-slate-700 active:shadow-sm font-semibold",
        /** Navy brand — solid dark */
        secondary:
          "rounded-xl border-2 border-[hsl(246,47%,8%)] bg-[hsl(246,47%,11%)] text-white shadow-md hover:bg-[hsl(246,47%,20%)] hover:border-[hsl(246,47%,28%)] hover:shadow-lg active:bg-[hsl(246,47%,7%)] active:border-[hsl(246,47%,6%)] active:shadow-sm font-semibold",
        /** Amber — solid second CTA */
        accent:
          "rounded-xl border-2 border-amber-600 bg-amber-500 text-[hsl(222,47%,9%)] shadow-md hover:bg-amber-400 hover:border-amber-500 hover:shadow-lg active:bg-amber-600 active:border-amber-700 active:shadow-sm font-semibold",
        /** Tinted chip — still visibly colored */
        link:
          "rounded-lg bg-primary/20 text-primary border-2 border-primary/35 shadow-sm hover:bg-primary/32 hover:border-primary/55 hover:shadow active:bg-primary/40 active:border-primary/60 underline-offset-4 font-semibold",
      },
      size: {
        default: "h-10 rounded-xl px-8 text-base font-semibold",
        sm: "h-9 rounded-xl px-4 text-sm font-semibold",
        lg: "min-h-11 h-auto rounded-xl px-10 py-3 text-base font-semibold",
        icon: "h-10 w-10 shrink-0 rounded-xl p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
