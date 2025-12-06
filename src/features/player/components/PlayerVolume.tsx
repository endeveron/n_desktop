'use client';

import { Volume2, VolumeX } from 'lucide-react';
import { RefObject, useState } from 'react';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn/Popover';
import { Slider } from '@/components/shadcn/Slider';
import { useStore } from '@/store';

interface PlayerVolumeProps {
  audioRef: RefObject<HTMLAudioElement | null>;
  orientation?: 'vertical' | 'horizontal';
}

const PlayerVolume = ({
  audioRef,
  orientation = 'vertical',
}: PlayerVolumeProps) => {
  const { audioPlayerVolume, setAudioPlayerVolume } = useStore();

  const [volume, setVolume] = useState(audioPlayerVolume * 100);

  const handleValueChange = (value: number) => {
    if (!audioRef.current) return;

    // Update Slider
    setVolume(value);

    // Update audio element
    audioRef.current.volume = value / 100;
  };

  // Save to store
  const handleValueCommit = (value: number) => {
    setAudioPlayerVolume(value);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="p-2 text-muted/70 hover:text-accent transition-colors cursor-pointer">
          {volume === 0 ? (
            <VolumeX className="w-3.5 h-3.5" />
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent side="top" align="start" className="w-8 p-3">
        <Slider
          value={[volume]}
          max={100}
          step={5}
          onValueChange={(value) => handleValueChange(value[0])}
          onValueCommit={(value) => handleValueCommit(value[0] / 100)}
          orientation={orientation}
        />
      </PopoverContent>
    </Popover>
  );
};

export default PlayerVolume;
