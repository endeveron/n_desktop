'use client';

import { RefreshIcon } from '@/components/icons/RefreshIcon';
import { Button } from '@/components/shadcn/Button';
import { cn } from '@/utils';

interface UpdateButtonProps {
  loading: boolean;
  onUpdate: () => void;
}

const UpdateButton = ({ loading, onUpdate }: UpdateButtonProps) => {
  return (
    <Button
      size="sm"
      variant="outline"
      className={cn('group px-1.75!', loading && 'pointer-events-none')}
      onClick={onUpdate}
    >
      <RefreshIcon
        className={cn(
          'group-hover:text-black',
          loading && 'animate-spin text-accent'
        )}
      />
    </Button>
  );
};

export default UpdateButton;
