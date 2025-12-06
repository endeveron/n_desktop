'use client';

import { Card } from '@/components/shared/Card';
import { ContentBox } from '@/components/shared/ContentBox';
import Time from '@/components/shared/Time';
import Facts from '@/features/facts/components/Facts';
import AudioPlayer from '@/features/player/components/AudioPlayer';
import { cn } from '@/utils';

interface ExtraColumnProps {
  isVisible: boolean;
}

const ExtraColumn = ({ isVisible }: ExtraColumnProps) => {
  return (
    <div
      className={cn(
        'flex flex-col w-74 shrink-0 gap-2',
        !isVisible && 'hidden'
      )}
    >
      <Card size="xs" className="flex-center">
        <Time />
      </Card>

      <ContentBox className="flex flex-col">
        <AudioPlayer />
        <Facts />
      </ContentBox>
    </div>
  );
};

export default ExtraColumn;
