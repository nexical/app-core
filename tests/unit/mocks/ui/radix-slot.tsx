import React from 'react';

export const Slot = React.forwardRef<HTMLElement, any>(({ children, ...props }, ref) => {
  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      ...(children.props as any),
      ref,
      className: [(props as any).className, (children.props as any).className]
        .filter(Boolean)
        .join(' '),
    });
  }
  return null;
});

export const Root = Slot;

export const Slottable = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export const createSlot = () => Slot;
export const createSlottable = () => Slottable;
