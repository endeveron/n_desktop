import { useEffect, useMemo, useRef } from 'react';
import { toast } from 'sonner';

import { ASSETS_URL } from '@/constants';
import { PLAYLIST_MAP, TRACK_MAP } from '@/features/player/data';
import { LoopMode } from '@/features/player/types';
import { useStore } from '@/store';
import { fadeVolume } from '@/features/player/utils';

export const useAudioPlayer = () => {
  const {
    audioTrackId,
    audioPlayerVolume,
    audioTrackDuration,
    browsingPlaylistId,
    isAudioPlayerLoading,
    isAudioPlaylistOpen,
    isAutoPlay,
    isAudioPlaying,
    audioLoopMode,
    nextAudioTrack,
    previousAudioTrack,
    resetAudioPlaylist,
    setAudioPlayerLoading,
    setBrowsingAudioPlaylistId,
    setAudioPlaylistOpen,
    setAudioTrackDuration,
    setAudioTrackId,
    setAudioTrackLength,
    setAudioPlaying,
    toggleAudioLoop,
  } = useStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isUserInteractedRef = useRef(false);

  const audioTrack = audioTrackId ? TRACK_MAP.get(audioTrackId) : null;
  const browsingPlaylist = PLAYLIST_MAP.get(browsingPlaylistId) || [];
  const browsingPlaylistLength = browsingPlaylist.length;

  const hasNextAudioTrack = useMemo(() => {
    if (audioLoopMode === LoopMode.ALL) return true;
    if (!audioTrack) return false;

    const playlist = PLAYLIST_MAP.get(audioTrack.playlistId) || [];
    const curIndex = playlist.findIndex((t) => t.id === audioTrackId);
    return curIndex < playlist.length - 1;
  }, [audioTrack, audioTrackId, audioLoopMode]);

  const hasPreviousAudioTrack = useMemo(() => {
    if (!audioTrack) return false;

    const playlist = PLAYLIST_MAP.get(audioTrack.playlistId) || [];
    const curIndex = playlist.findIndex((t) => t.id === audioTrackId);
    return curIndex > 0;
  }, [audioTrack, audioTrackId]);

  const setUserInteracted = () => {
    if (isUserInteractedRef.current) return;
    isUserInteractedRef.current = true;
  };

  const unloadAudio = () => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    // Fade out if audio is playing
    if (!audio.paused && audio.volume > 0) {
      fadeVolume({
        audio,
        duration: 500, // Shorter fade for unload
        fadeIntervalRef,
        targetVolume: 0,
      });
    }

    audio.pause();
    audio.currentTime = 0;
    audio.src = '';
  };

  // Shared play logic with fade-in
  const playAudioWithFade = async ({
    audio,
    targetVolume,
  }: {
    audio: HTMLAudioElement;
    targetVolume: number;
  }) => {
    try {
      audio.volume = 0; // Start at zero volume

      await audio.play();
      fadeVolume({
        audio,
        duration: 1000,
        fadeIntervalRef,
        targetVolume,
      });

      setAudioPlaying(true);
    } catch (error) {
      toast('Audio playback failed');
      console.error('Audio playback failed:', error);
    }
  };

  // Initialize audio element
  useEffect(() => {
    if (!audioTrack) return;

    if (audioRef.current) {
      const oldAudio = audioRef.current;

      // Cancel any ongoing fade
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }

      // Immediate cleanup without fade (new track is starting)
      oldAudio.pause();
      oldAudio.currentTime = 0;
      oldAudio.src = '';
    }

    const audioUrl = `${ASSETS_URL}/${audioTrack.fileName}.mp3`;
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    setAudioPlayerLoading(true);

    // Handle when audio can play
    const handleCanPlay = () => {
      setAudioPlayerLoading(false);
      setAudioTrackDuration(audio.duration);

      // Play audio
      if (isAutoPlay && isUserInteractedRef.current) {
        playAudioWithFade({
          audio,
          targetVolume: audioPlayerVolume,
        });
      }
    };

    // Handle errors
    const handleError = (e: unknown) => {
      console.error(e);
      toast('Audio loading error');
    };

    // Update audioTrackDuration when metadata loads
    const handleLoadedMetadata = () => {
      setAudioTrackDuration(audio.duration);
    };

    // Handle when track ends
    const handleEnded = () => {
      // Fade out before moving to next track
      fadeVolume({
        audio,
        duration: 500,
        fadeIntervalRef,
        targetVolume: 0,
      });
      audio.pause();
      nextAudioTrack();
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    // Set initial volume
    audio.volume = audioPlayerVolume;

    // Cleanup
    return () => {
      // Remove event listeners
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);

      // Stop playback and release resources
      audio.pause();
      audio.currentTime = 0; // Reset position
      audio.src = '';
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioTrack]);

  // Save track data in store
  useEffect(() => {
    setAudioTrackLength(browsingPlaylistLength);
  }, [browsingPlaylistLength, setAudioTrackLength]);

  const handleNextAudioTrack = () => {
    if (!audioRef.current) return;
    unloadAudio();
    nextAudioTrack();
  };

  const handlePrevAudioTrack = () => {
    if (!audioRef.current) return;
    unloadAudio();
    previousAudioTrack();
  };

  const handleResetAudioPlaylist = () => {
    if (!audioRef.current) return;
    unloadAudio();
    resetAudioPlaylist();
  };

  const handleAudioTrackSelect = (trackId: string) => {
    setUserInteracted();
    unloadAudio();
    setAudioTrackId(trackId);
  };

  const handleBrowsingPlaylistId = (playlistId: string) => {
    if (PLAYLIST_MAP.has(playlistId)) {
      setBrowsingAudioPlaylistId(playlistId);
    }
  };

  const toggleLoop = () => {
    toggleAudioLoop();
  };

  const togglePlaylistMenu = () => {
    setAudioPlaylistOpen(!isAudioPlaylistOpen);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;

    setUserInteracted();

    if (isAudioPlaying) {
      // Add fade out on pause
      fadeVolume({
        audio: audioRef.current,
        duration: 300,
        fadeIntervalRef,
        targetVolume: 0,
      }).then(() => {
        audioRef.current?.pause();
        setAudioPlaying(false);
      });
    } else {
      playAudioWithFade({
        audio: audioRef.current,
        targetVolume: audioPlayerVolume,
      });
    }
  };

  // useEffect(() => {
  //   console.log('\n[DEBUG] useAudioPlayer');
  //   console.log(`Playing: ${audioTrackId}, Browsing: ${browsingPlaylistId}`);
  // });

  return {
    audio: audioRef.current,
    audioRef,
    audioLoopMode,
    audioTrack,
    audioTrackId,
    audioTrackDuration,
    browsingPlaylist,
    browsingPlaylistId,
    browsingPlaylistLength,
    hasNextAudioTrack,
    hasPreviousAudioTrack,
    handleAudioTrackSelect,
    handleBrowsingPlaylistId,
    handleNextAudioTrack,
    handlePrevAudioTrack,
    handleResetAudioPlaylist,
    isAudioPlayerLoading,
    isAudioPlaying,
    isAudioPlaylistOpen,
    playlistCount: PLAYLIST_MAP.size,
    toggleLoop,
    togglePlay,
    togglePlaylistMenu,
  };
};
