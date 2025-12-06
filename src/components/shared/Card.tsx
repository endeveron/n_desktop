'use client';

import { forwardRef } from 'react';

import { cn } from '@/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  focusByTab?: boolean;
  loading?: string;
  size?: 'default' | 'fill' | 'sm' | 'xs';
  onBlur?: React.FocusEventHandler<HTMLDivElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className,
      focusByTab,
      loading,
      size = 'default',
      onBlur,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        tabIndex={focusByTab ? 0 : -1}
        className={cn(
          'anim-fade card min-h-14 min-w-74 w-full flex items-center shrink-0 cursor-default trans-a',
          focusByTab && 'focus:outline-none dark:focus:bg-popover-focus',
          loading && 'opacity-40 pointer-events-none',
          size === 'fill' && 'h-full flex-1',
          size === 'sm' && 'h-20',
          size === 'xs' && 'h-14',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

export { Card };
