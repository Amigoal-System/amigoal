
import * as React from 'react';
import * as ToolbarPrimitive from '@radix-ui/react-toolbar';
import { cn, withCn, withRef, withVariants } from '@udecode/cn';
import { cva, VariantProps } from 'class-variance-authority';
import { Separator } from './separator';
import { MoreVertical } from 'lucide-react'; // Changed import

const toolbarVariants = cva(
  'relative flex select-none items-stretch gap-1 bg-background',
  {
    variants: {
      variant: {
        default: 'flex-wrap',
        ghost: 'flex-wrap',
      },
      size: {
        sm: 'h-9',
        md: 'h-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export const Toolbar = withRef<
  typeof ToolbarPrimitive.Root,
  VariantProps<typeof toolbarVariants>
>(({ className, ...props }, ref) => (
  <ToolbarPrimitive.Root
    ref={ref}
    className={cn(toolbarVariants(), className)}
    {...props}
  />
));

const linkVariants = cva(
  'font-medium underline underline-offset-4',
  {
    variants: {},
    defaultVariants: {},
  }
);

export const ToolbarLink = withCn(
  ToolbarPrimitive.Link,
  linkVariants
);

export const ToolbarSeparator = withCn(
  ToolbarPrimitive.Separator,
  'my-1 w-px shrink-0 bg-border'
);

const toggleItemVariants = cva(
  cn(
    'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    '[&_svg:not([data-icon])]:size-5'
  ),
  {
    variants: {
      variant: {
        default:
          'bg-transparent hover:bg-muted hover:text-muted-foreground aria-checked:bg-accent aria-checked:text-accent-foreground',
        outline:
          'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        sm: 'h-9 px-2',
        md: 'h-10 px-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
    },
  }
);

export const ToolbarButton = withVariants(
  ToolbarPrimitive.Button,
  toggleItemVariants,
  ['variant', 'size']
);

export const ToolbarToggleItem = withVariants(
  ToolbarPrimitive.ToggleItem,
  toggleItemVariants,
  ['variant', 'size']
);

const toggleGroupVariants = cva('flex items-center justify-center gap-1', {
  variants: {},
  defaultVariants: {},
});

export const ToolbarToggleGroup = withCn(
  ToolbarPrimitive.ToggleGroup,
  toggleGroupVariants
);

export const ToolbarGroup = withRef<
  'div',
  {
    noSeparator?: boolean;
  }
>(({ className, children, noSeparator }, ref) => {
  const childArr = React.Children.map(children, (c) => c);
  if (!childArr || childArr.length === 0) return null;

  return (
    <div ref={ref} className={cn('flex', className)}>
      {!noSeparator && (
        <div className="h-full py-1">
          <Separator orientation="vertical" />
        </div>
      )}

      <div className="mx-1 flex items-center gap-1">{children}</div>
    </div>
  );
});

// We are not using a separate Icons component for toolbar to avoid import issues
export const ToolbarIcons = {
  more: MoreVertical
};
