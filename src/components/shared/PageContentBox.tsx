'use client';

import { forwardRef } from 'react';

import { ScrollArea } from '@/components/shadcn/ScrollArea';
import { cn } from '@/utils';

export interface PageContentBoxProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  loading?: boolean;
}

const PageContentBox = forwardRef<HTMLDivElement, PageContentBoxProps>(
  ({ children, className, loading, ...props }, ref) => {
    return (
      <div className="relative h-full flex-1">
        <div className="absolute inset-0">
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
        </div>
      </div>
    );
  }
);
PageContentBox.displayName = 'PageContentBox';

export { PageContentBox };
