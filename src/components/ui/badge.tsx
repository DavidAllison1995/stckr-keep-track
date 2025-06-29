
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-purple-600 text-white shadow hover:bg-purple-700",
        secondary:
          "border-transparent bg-gray-800 text-gray-200 hover:bg-gray-700",
        destructive:
          "border-transparent bg-red-600 text-white shadow hover:bg-red-700",
        outline: "text-gray-300 border-gray-600",
        success:
          "border-transparent bg-green-800 text-green-200 hover:bg-green-700",
        warning:
          "border-transparent bg-amber-800 text-amber-200 hover:bg-amber-700",
        error:
          "border-transparent bg-red-800 text-red-200 hover:bg-red-700",
        info:
          "border-transparent bg-purple-800 text-purple-200 hover:bg-purple-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
