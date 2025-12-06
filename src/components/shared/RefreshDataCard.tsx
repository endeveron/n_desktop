'use client';

import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shadcn/Button';
import { cn } from '@/utils';

export interface NewsCardProps {
  onRefresh: () => void;
  title: string;
  allowed: boolean;
}

const RefreshDataCard = ({ onRefresh, allowed, title }: NewsCardProps) => {
  const handleClick = () => {
    if (!allowed) return;

    onRefresh();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!allowed) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      onRefresh();
    }
  };

  return (
    <Card
      size="sm"
      onKeyDown={handleKeyDown}
      focusByTab
      className={cn('flex-center', !allowed && 'opacity-40 cursor-not-allowed')}
      aria-label={`Refresh data`}
    >
      <Button
        tabIndex={-1}
        onClick={handleClick}
        className={cn('text-sm', !allowed && 'opacity-40 pointer-events-none')}
        variant="outline"
      >
        {title}
      </Button>
    </Card>
  );
};

export default RefreshDataCard;
