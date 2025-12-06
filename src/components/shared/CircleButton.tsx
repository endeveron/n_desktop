'use client';

import { Button } from '@/components/shadcn/Button';
import { cn } from '@/utils';

interface CircleButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

const CircleButton = ({
  children,
  onClick,
  className,
  disabled,
}: CircleButtonProps) => {
  return (
    <Button
      size="sm"
      variant="outline"
      className={cn(
        'px-1.75! trans-o!',
        disabled && 'opacity-40 pointer-events-none',
        className
      )}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

export default CircleButton;
