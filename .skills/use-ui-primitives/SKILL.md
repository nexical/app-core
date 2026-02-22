# Skill: Use UI Primitives

This skill defines the authoritative standards for building and extending the **Nexus UI Primitive Layer**. Every core component in `core/src/components/ui/` MUST strictly adhere to these patterns to ensure accessibility, extensibility, and consistent styling across the modular monolith.

## Core Patterns

### 1. Polymorphic UI (asChild)

All UI primitives MUST support the `asChild` pattern using `@radix-ui/react-slot`. This allows consumers to swap the underlying DOM element while maintaining all styles and behaviors.

- **Mandate**: Use `const Comp = asChild ? Slot : 'button';` (or appropriate element).
- **Benefit**: Allows seamless integration with routing libraries (`<Button asChild><a href="...">Link</a></Button>`) without DOM nesting issues.

### 2. Variant-Based Styling (CVA)

Component styles and variants MUST be managed using `class-variance-authority` (CVA).

- **Mandate**: Define a `const componentVariants = cva(...)` and export it alongside the component.
- **Rule**: Use the `cn` utility to merge base classes, variants, and incoming `className`.
- **Semantic Classes**: CVA definitions SHOULD use semantic class names (e.g., `btn-default`, `btn-ghost`) that are defined in `@layer components` CSS files rather than raw utility strings.

### 3. Metadata Data Attributes

Every primitive MUST include explicit data attributes for identification and state-based styling.

- **Mandate**: Include `data-slot="{component-name}"` on the root element.
- **Mandate**: Include individual data-attributes for each variant state (e.g., `data-variant={variant}`, `data-size={size}`).
- **Purpose**: Facilitates testing (via `data-testid` separation) and allows CSS-based styling overrides without class collision.

### 4. Ref Forwarding & DisplayName

All UI primitives MUST use `React.forwardRef` to ensure they can be used with focus management and third-party libraries (like Tooltips or Popovers).

- **Mandate**: Always set a `displayName` matching the component name.

## Implementation Standard

```tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const primitiveVariants = cva(
  'primitive-base', // Semantic base class - refer to @layer components
  {
    variants: {
      variant: {
        default: 'primitive-default', // Semantic class
        destructive: 'primitive-destructive',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface PrimitiveProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof primitiveVariants> {
  asChild?: boolean;
}

const Primitive = React.forwardRef<HTMLButtonElement, PrimitiveProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(primitiveVariants({ variant, size, className }))}
        ref={ref}
        data-slot="primitive"
        data-variant={variant}
        data-size={size}
        {...props}
      />
    );
  },
);
Primitive.displayName = 'Primitive';

export { Primitive, primitiveVariants };
```

## Available Resources

- **Templates**: `core/.skills/use-ui-primitives/templates/primitive.tsx.template`
- **Examples**:
  - `core/.skills/use-ui-primitives/examples/button-primitive.tsx`
  - `core/.skills/use-ui-primitives/examples/input-primitive.tsx`
- **Related Standards**: `core/CODE.md` Section 4 (Styling & CSS).
