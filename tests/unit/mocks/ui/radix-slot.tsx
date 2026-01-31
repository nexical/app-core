import React from 'react';

type SlotProps = {
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>;

export const Slot = React.forwardRef<HTMLElement, SlotProps>(({ children, ...props }, ref) => {
  if (React.isValidElement(children)) {
    const childProps = children.props as React.HTMLAttributes<HTMLElement>;
    return React.cloneElement(children, {
      ...props,
      ...childProps,
      ref,
      className: [props.className, childProps.className].filter(Boolean).join(' '),
    } as React.Attributes & SlotProps);
  }
  return null;
});
Slot.displayName = 'Slot';

export const Root = Slot;

export const Slottable = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export const createSlot = () => Slot;
export const createSlottable = () => Slottable;
