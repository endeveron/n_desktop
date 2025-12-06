import { useEffect, useState } from 'react';

import { Slider } from '@/components/shadcn/Slider';
import { formatTime } from '@/features/player/utils';

interface PlayerTimelineProps {
  audio: HTMLAudioElement | null;
  audioTrackDuration: number;
}

export const PlayerTimeline = ({
  audio,
  audioTrackDuration,
}: PlayerTimelineProps) => {
  const [time, setTime] = useState(0);

  // Update current time as audio plays
  useEffect(() => {
    if (!audio) return;

    const handleTimeUpdate = () => {
      setTime(audio.currentTime);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [audio]);

  return (
    <div>
      <Slider hideThumb value={[time]} max={audioTrackDuration} step={0.1} />
      <div className="mt-1 flex justify-between text-[10px] text-muted font-bold select-none">
        <span>{formatTime(time)}</span>
        <span>{formatTime(audioTrackDuration)}</span>
      </div>
    </div>
  );
};
