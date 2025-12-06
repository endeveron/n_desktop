'use client';

import {
  ArrowLeft,
  ArrowLeftToLine,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Pause,
  Play,
  Repeat,
  Repeat1,
} from 'lucide-react';

import { ScrollArea } from '@/components/shadcn/ScrollArea';
import { Card } from '@/components/shared/Card';
import CircleButton from '@/components/shared/CircleButton';
import { PlayerTimeline } from '@/features/player/components/PlayerTimeline';
import PlayerVolume from '@/features/player/components/PlayerVolume';
import { useAudioPlayer } from '@/features/player/hooks/useAudioPlayer';
import { LoopMode } from '@/features/player/types';
import { cn } from '@/utils';

const AudioPlayer = () => {
  const {
    audio,
    audioRef,
    audioTrackDuration,
    audioTrack,
    audioTrackId,
    browsingPlaylist,
    browsingPlaylistId,
    browsingPlaylistLength,
    hasNextAudioTrack,
    hasPreviousAudioTrack,
    isAudioPlayerLoading,
    isAudioPlaying,
    isAudioPlaylistOpen,
    audioLoopMode,
    handleBrowsingPlaylistId,
    handleAudioTrackSelect,
    handleResetAudioPlaylist,
    handleNextAudioTrack,
    handlePrevAudioTrack,
    toggleLoop,
    togglePlay,
    togglePlaylistMenu,
  } = useAudioPlayer();

  return (
    <div className="space-y-2">
      <Card>
        <div
          className={cn(
            'relative w-74 px-3 py-4',
            isAudioPlayerLoading && 'pointer-events-none'
          )}
        >
          {/* Track title */}
          <div
            className={cn(
              'mt-1 flex-center gap-2 text-xs text-muted font-bold truncate trans-o',
              isAudioPlayerLoading && 'opacity-40'
            )}
          >
            <span className="tracking-wide">{audioTrack?.title}</span>-
            <span>{audioTrack?.artist}</span>
          </div>

          {/* Timeline */}
          <div className="mt-3.25">
            <PlayerTimeline
              audio={audio}
              audioTrackDuration={audioTrackDuration}
              key={audioTrackId}
            />
          </div>

          {/* Navbar */}
          <div className="-translate-y-0.5 flex-center gap-3">
            {/* Reset Button */}
            <CircleButton
              disabled={!hasPreviousAudioTrack}
              onClick={handleResetAudioPlaylist}
            >
              <ArrowLeftToLine />
            </CircleButton>

            {/* Prev Button */}
            <CircleButton
              disabled={!hasPreviousAudioTrack}
              onClick={handlePrevAudioTrack}
            >
              <ArrowLeft />
            </CircleButton>

            {/* Play/Pause Button */}
            <CircleButton onClick={togglePlay} className="group">
              {isAudioPlaying ? (
                <Pause
                  size={24}
                  className="text-accent group-hover:text-black"
                />
              ) : (
                <Play size={24} />
              )}
            </CircleButton>

            {/* Next Button */}
            <CircleButton
              disabled={!hasNextAudioTrack}
              onClick={handleNextAudioTrack}
            >
              <ArrowRight />
            </CircleButton>

            {/* Loop Button */}
            <CircleButton onClick={toggleLoop} className="group">
              {audioLoopMode === LoopMode.DISABLED && <Repeat />}
              {audioLoopMode === LoopMode.SINGLE && (
                <Repeat1 className="text-accent group-hover:text-black" />
              )}
              {audioLoopMode === LoopMode.ALL && (
                <Repeat className="text-accent group-hover:text-black" />
              )}
            </CircleButton>
          </div>

          {/* Volume control */}
          <div className="absolute bottom-1 right-1">
            <PlayerVolume audioRef={audioRef} />
          </div>

          {/* Playlist toggle */}
          <div
            onClick={togglePlaylistMenu}
            className="absolute bottom-0.75 left-1 p-2 text-muted/70 hover:text-accent transition-colors cursor-pointer"
          >
            {isAudioPlaylistOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>
      </Card>

      {/* Playlists card */}
      {isAudioPlaylistOpen && (
        <Card className="px-3 flex-center gap-6">
          <button
            onClick={() => handleBrowsingPlaylistId('0')}
            className={cn(
              'text-muted hover:text-accent text-[10px] uppercase font-semibold cursor-pointer trans-c',
              browsingPlaylistId === '0' && 'text-accent pointer-events-none'
            )}
          >
            OS
          </button>

          <button
            onClick={() => handleBrowsingPlaylistId('1')}
            className={cn(
              'text-muted hover:text-accent text-[10px] uppercase font-semibold cursor-pointer trans-c',
              browsingPlaylistId === '1' && 'text-accent pointer-events-none'
            )}
          >
            NastelBom
          </button>
        </Card>
      )}

      {/* Playlist card */}
      {isAudioPlaylistOpen && browsingPlaylistLength > 0 && (
        // <Card className="flex-col items-start h-36">
        <Card className="flex-col items-start">
          <ScrollArea className="relative size-full">
            <div className="py-3">
              {browsingPlaylist.map((track) => {
                const isActive = audioTrack?.id === track.id;
                const isPlaying = isActive && isAudioPlaying;
                return (
                  <div
                    onClick={() => handleAudioTrackSelect(track.id)}
                    className={cn(
                      'w-full flex gap-2 px-3 py-1.5 text-xs text-muted font-bold truncate hover:bg-popover/70 trans-a group cursor-pointer',
                      isActive && 'bg-popover/70',
                      isPlaying && 'pointer-events-none'
                    )}
                    key={track.id}
                  >
                    <span>{track.index + 1}</span>
                    <span
                      className={cn(
                        'tracking-wide group-hover:text-foreground trans-c',
                        isPlaying && 'text-accent'
                      )}
                    >
                      {track.title}
                    </span>
                    <span>-</span>
                    <span>{track.artist}</span>
                  </div>
                );
              })}
            </div>
            <div className="absolute top-0 left-0 inset-x-0 h-4 bg-linear-to-b from-card to-transparent"></div>
            <div className="absolute bottom-0 left-0 inset-x-0 h-4 bg-linear-to-t from-card to-transparent"></div>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
};

export default AudioPlayer;
