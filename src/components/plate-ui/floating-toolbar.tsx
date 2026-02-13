
'use client';

import { cn } from '@udecode/cn';
import {
  flip,
  offset,
  UseVirtualFloatingOptions,
  useFloatingToolbarState,
  useFloatingToolbar,
  FloatingToolbar as FloatingToolbarPrimitive,
} from '@udecode/plate-floating';
import React from 'react';

import { Separator } from './separator';
import { Toolbar, ToolbarProps } from './toolbar';

export const FloatingToolbar = React.forwardRef<
  React.ElementRef<typeof Toolbar>,
  ToolbarProps
>(({ children, ...props }, ref) => {
  const [open, setOpen] = React.useState(true);

  const floatingOptions: UseVirtualFloatingOptions = {
    open,
    onOpenChange: setOpen,
    placement: 'top',
    middleware: [
      offset(12),
      flip({
        padding: 12,
        fallbackPlacements: [
          'top-start',
          'top-end',
          'bottom-start',
          'bottom-end',
        ],
      }),
    ],
  };

  const state = useFloatingToolbarState({
    ...props,
    floatingOptions: {
      ...props.floatingOptions,
      ...floatingOptions,
    },
  });

  const {
    ref: floatingRef,
    props: rootProps,
    hidden,
  } = useFloatingToolbar(state);

  if (hidden) return null;

  return (
    <Toolbar
      ref={floatingRef}
      className={cn(
        'absolute z-50 whitespace-nowrap border bg-popover px-1 opacity-100 shadow-md print:hidden'
      )}
      {...rootProps}
      {...props}
    >
      {children}
    </Toolbar>
  );
});
FloatingToolbar.displayName = 'FloatingToolbar';

export const FloatingToolbarContent = React.forwardRef<
  React.ElementRef<typeof Toolbar>,
  React.ComponentPropsWithoutRef<typeof Toolbar>
>(({ className, ...props }, ref) => {
  return (
    <Toolbar
      ref={ref}
      className={cn(
        'flex-wrap rounded-md border bg-popover p-1',
        className
      )}
      {...props}
    />
  );
});
FloatingToolbarContent.displayName = 'FloatingToolbarContent';

export const FloatingToolbarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentPropsWithoutRef<typeof Separator>
>(({ className, ...props }, ref) => {
  return (
    <Separator
      ref={ref}
      className={cn('my-1 h-8 w-px bg-muted', className)}
      orientation="vertical"
      {...props}
    />
  );
});
FloatingToolbarSeparator.displayName = 'FloatingToolbarSeparator';
