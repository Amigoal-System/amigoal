'use client';
import * as React from 'react';
import { cn } from '@/lib/utils';

const Timeline = React.forwardRef<
  HTMLOListElement,
  React.HTMLAttributes<HTMLOListElement>
>(({ className, ...props }, ref) => (
  <ol ref={ref} className={cn('flex flex-col', className)} {...props} />
));
Timeline.displayName = 'Timeline';

const TimelineItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn('relative flex flex-col gap-2 pb-8', className)}
    {...props}
  />
));
TimelineItem.displayName = 'TimelineItem';

const TimelineConnector = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('absolute left-3 top-[18px] h-full w-px bg-border', className)}
    {...props}
  />
));
TimelineConnector.displayName = 'TimelineConnector';

const TimelineHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center gap-4', className)}
    {...props}
  />
));
TimelineHeader.displayName = 'TimelineHeader';

const TimelineIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground',
      className
    )}
    {...props}
  />
));
TimelineIcon.displayName = 'TimelineIcon';

const TimelineTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn('font-semibold', className)} {...props} />
));
TimelineTitle.displayName = 'TimelineTitle';

const TimelineBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('ml-10', className)} {...props} />
));
TimelineBody.displayName = 'TimelineBody';

export {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineIcon,
  TimelineTitle,
  TimelineBody,
};
