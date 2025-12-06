'use client';

import { cn } from '@/utils';

interface TaskbarProps {
  className?: string;
  children?: React.ReactNode;
  loading?: boolean;
}

const Taskbar = ({ className, children, loading }: TaskbarProps) => {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center gap-2 mx-auto trans-o',
        loading && 'opacity-100 pointer-events-none',
        className
      )}
    >
      {children}
    </div>
  );
};

export default Taskbar;
