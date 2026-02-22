
'use client';

import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

const spinnerVariants = cva(
  "animate-spin text-primary",
  {
    variants: {
      size: {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
}

export function Spinner({ size, className }: SpinnerProps) {
  return (
    <Loader2 className={cn(spinnerVariants({ size }), className)} />
  );
}
