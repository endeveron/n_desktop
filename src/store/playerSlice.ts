import { StateCreator } from 'zustand';

import { LoopMode } from '@/features/player/types';
import { getPlaylistTracks } from '@/features/player/utils';
import { initialState } from '@/store';
import { PLAYLIST_MAP } from '@/features/player/data';

export interface PlayerSlice {
  audioPlayerVolume: number;
  audioTrackDuration: number;
  audioTrackId: string | null;
  audioTrackLength: number;
  browsingPlaylistId: string;
  isAudioPlaying: boolean;
  isAudioPlayerLoading: boolean;
  isAudioPlaylistOpen: boolean;
  isAutoPlay: boolean;
  audioLoopMode: LoopMode;
  nextAudioTrack: () => void;
  previousAudioTrack: () => void;
  resetAudioPlaylist: () => void;
  setAudioPlayerLoading: (value: boolean) => void;
  setAudioPlayerVolume: (value: number) => void;
  setBrowsingAudioPlaylistId: (id: string) => void;
  setAudioPlaylistOpen: (value: boolean) => void;
  setAudioTrackDuration: (value: number) => void;
  setAudioTrackId: (id: string) => void;
  setAudioTrackLength: (value: number) => void;
  setAutoPlay: (value: boolean) => void;
  setAudioPlaying: (value: boolean) => void;
  toggleAudioLoop: () => void;
}

export const playerSlice: StateCreator<PlayerSlice, [], [], PlayerSlice> = (
  set,
  get
) => ({
  ...initialState,

  nextAudioTrack: () => {
    const { audioLoopMode, audioTrackId } = get() as PlayerSlice;

    if (!audioTrackId) {
      console.error('No current track');
      return;
    }

    const playlistTracks = getPlaylistTracks(audioTrackId);
    if (!playlistTracks) return;

    const curIndex = playlistTracks.findIndex((t) => t.id === audioTrackId);
    const lastIndex = playlistTracks.length - 1;
    const loopMode = audioLoopMode;

    // Case A: Loop mode is SINGLE
    // Action: Restart track
    if (loopMode === LoopMode.SINGLE) {
      // console.log('Case A');
      set({
        audioTrackId: audioTrackId,
        isAudioPlaying: false,
        isAutoPlay: true,
      });
      return;
    }

    // Case B: Loop mode is ALL. All tracks are played
    // Action: Restart playlist
    if (loopMode === LoopMode.ALL && curIndex === lastIndex) {
      // console.log('Case B');
      set({
        audioTrackId: playlistTracks[0].id,
        isAudioPlaying: false,
        isAutoPlay: true, // Autoplay is ENABLED
      });
      return;
    }

    // Case C: Loop mode is DISABLED. All tracks are played
    // Action: Play first track of next playlist (or first playlist if last)
    if (loopMode === LoopMode.DISABLED && curIndex === lastIndex) {
      // console.log('Case C');
      const { browsingPlaylistId } = get() as PlayerSlice;
      const allPlaylistIds = Array.from(PLAYLIST_MAP.keys());
      const currentPlaylistIndex = allPlaylistIds.indexOf(browsingPlaylistId);
      const nextPlaylistId =
        currentPlaylistIndex === allPlaylistIds.length - 1
          ? allPlaylistIds[0] // Go to first playlist
          : allPlaylistIds[currentPlaylistIndex + 1]; // Go to next playlist

      const nextPlaylist = PLAYLIST_MAP.get(nextPlaylistId);
      if (nextPlaylist && nextPlaylist.length > 0) {
        set({
          audioTrackId: nextPlaylist[0].id,
          browsingPlaylistId: nextPlaylistId,
          isAudioPlaying: false,
          isAutoPlay: true, // Autoplay ENABLED to play first track of next playlist
        });
      }
      return;
    }

    // Default case: Play next track
    if (curIndex < lastIndex) {
      // console.log('Case D');
      set({
        audioTrackId: playlistTracks[curIndex + 1].id,
        isAudioPlaying: false,
        isAutoPlay: true,
      });
      return;
    }

    console.error('Unhandled case');
    console.log('isLast', curIndex === lastIndex);
    console.log('loopMode', loopMode);
  },

  previousAudioTrack: () => {
    const { audioTrackId } = get() as PlayerSlice;

    if (!audioTrackId) {
      console.error('No current track');
      return;
    }

    const playlistTracks = getPlaylistTracks(audioTrackId);
    if (!playlistTracks) return;

    const curIndex = playlistTracks.findIndex((t) => t.id === audioTrackId);

    if (curIndex === 0) {
      console.log('Already at first track');
      return;
    }

    set({
      audioTrackId: playlistTracks[curIndex - 1].id,
      isAudioPlaying: false,
      isAutoPlay: true,
    });
  },

  resetAudioPlaylist: () => {
    const { audioTrackId } = get() as PlayerSlice;

    if (!audioTrackId) {
      console.error('No current track');
      return;
    }

    const playlistTracks = getPlaylistTracks(audioTrackId);
    if (!playlistTracks) return;

    set({
      audioTrackId: playlistTracks[0].id,
      isAudioPlaying: false,
      isAutoPlay: false, // Autoplay is DISABLED
    });
  },

  setAudioPlayerLoading: (value) => {
    set({ isAudioPlayerLoading: value });
  },

  setAudioPlayerVolume: (value) => {
    set({ audioPlayerVolume: value });
  },

  setBrowsingAudioPlaylistId: (id) => {
    set({ browsingPlaylistId: id });
  },

  setAudioPlaylistOpen: (value) => {
    set({ isAudioPlaylistOpen: value });
  },

  setAudioTrackDuration: (value) => {
    set({ audioTrackDuration: value });
  },

  setAudioTrackId: (id) => {
    set({
      audioTrackId: id,
      isAudioPlaying: false,
      isAutoPlay: true,
    });
  },

  setAudioTrackLength: (value) => {
    set({ audioTrackLength: value });
  },

  setAutoPlay: (value) => {
    set({ isAutoPlay: value });
  },

  setAudioPlaying: (value) => {
    set({ isAudioPlaying: value });
  },

  toggleAudioLoop: () => {
    const { audioLoopMode } = get() as PlayerSlice;

    const loopModes = Object.values(LoopMode);
    const currentIndex = loopModes.indexOf(audioLoopMode);
    const nextIndex = (currentIndex + 1) % loopModes.length;

    set({ audioLoopMode: loopModes[nextIndex] });
  },
});
