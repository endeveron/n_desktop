import { PLAYLIST_MAP } from '@/features/player/data';
import { Track } from '@/features/player/types';
import { RefObject } from 'react';

export const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const getPlaylistId = (trackId: string): string => {
  return trackId.split('_')[0];
};

export const getPlaylistTracks = (trackId: string): Track[] | null => {
  const playlistId = getPlaylistId(trackId);
  const playlistTracks = PLAYLIST_MAP.get(playlistId);

  if (!playlistTracks || playlistTracks.length === 0) {
    console.error('Playlist not found');
    return null;
  }

  return playlistTracks;
};

export const fadeVolume = ({
  audio,
  duration = 500,
  fadeIntervalRef,
  targetVolume,
}: {
  audio: HTMLAudioElement;
  duration?: number;
  fadeIntervalRef: RefObject<NodeJS.Timeout | null>;
  targetVolume: number;
}): Promise<void> => {
  return new Promise((resolve) => {
    // Clear any existing fade
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    const startVolume = audio.volume;
    const volumeChange = targetVolume - startVolume;
    const steps = 20;
    const stepDuration = duration / steps;
    const volumeStep = volumeChange / steps;

    let currentStep = 0;

    fadeIntervalRef.current = setInterval(() => {
      currentStep++;

      if (currentStep >= steps) {
        audio.volume = targetVolume;
        clearInterval(fadeIntervalRef.current!);
        fadeIntervalRef.current = null;
        resolve();
      } else {
        audio.volume = Math.max(
          0,
          Math.min(1, startVolume + volumeStep * currentStep)
        );
      }
    }, stepDuration);
  });
};
