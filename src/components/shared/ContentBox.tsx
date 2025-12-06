'use client';

import { forwardRef } from 'react';

import { ScrollArea } from '@/components/shadcn/ScrollArea';
import { cn } from '@/utils';

export interface ContentBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
}

const ContentBox = forwardRef<HTMLDivElement, ContentBoxProps>(
  ({ children, className, loading, ...props }, ref) => {
    return (
      <ScrollArea className="size-full" ref={ref}>
        <div
          className={cn(
            'min-w-74 size-full gap-2 trans-o',
            loading && 'opacity-40 pointer-events-none',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </ScrollArea>
    );
  }
);
ContentBox.displayName = 'ContentBox';

export { ContentBox };
