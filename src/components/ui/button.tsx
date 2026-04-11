import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0C1629]/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[#0C1629] text-white hover:bg-[#2a4a63]',
        destructive: 'bg-[#9f403d] text-white hover:bg-[#8a3532]',
        outline: 'border border-[#D6DCE0] bg-white hover:bg-[#F0F3F3] text-[#0C1629]',
        secondary: 'bg-[#F0F3F3] text-[#0C1629] hover:bg-[#F0F3F3]',
        ghost: 'hover:bg-[#F0F3F3] text-[#727A84]',
        link: 'text-[#0C1629] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 rounded-[15px]',
        sm: 'h-8 px-3 text-xs rounded-[12px]',
        lg: 'h-10 px-8 rounded-[15px]',
        icon: 'h-9 w-9 rounded-[12px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
