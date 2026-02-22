import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva('input-base', {
  variants: {
    variant: {
      default: 'input-default',
      error: 'input-error',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>, VariantProps<typeof inputVariants> {}

/**
 * Standard Input Primitive with metadata attributes and ref forwarding.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, className }))}
        ref={ref}
        data-slot="input"
        data-variant={variant}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input, inputVariants };
