import { Track } from '@/features/player/types';

export const ALL_TRACKS: Track[] = [
  {
    id: '0_0',
    playlistId: '0',
    index: 0,
    title: 'Soft',
    artist: 'OS',
    fileName: 'audio_1',
  },
  {
    id: '0_1',
    playlistId: '0',
    index: 1,
    title: 'Inspirational',
    artist: 'OS',
    fileName: 'audio_2',
  },
  {
    id: '0_2',
    playlistId: '0',
    index: 2,
    title: 'Ambient',
    artist: 'OS',
    fileName: 'audio_3',
  },
  {
    id: '0_3',
    playlistId: '0',
    index: 3,
    title: 'Advertising',
    artist: 'OS',
    fileName: 'audio_4',
  },
  {
    id: '0_4',
    playlistId: '0',
    index: 4,
    title: 'Corporate',
    artist: 'OS',
    fileName: 'audio_5',
  },
  {
    id: '0_5',
    playlistId: '0',
    index: 5,
    title: 'Calm',
    artist: 'OS',
    fileName: 'audio_6',
  },

  {
    id: '1_0',
    playlistId: '1',
    index: 0,
    title: 'Motivation',
    artist: 'NastelBom',
    fileName: 'audio_7',
  },
  {
    id: '1_1',
    playlistId: '1',
    index: 1,
    title: 'Dream',
    artist: 'NastelBom',
    fileName: 'audio_8',
  },
  {
    id: '1_2',
    playlistId: '1',
    index: 2,
    title: 'Technology',
    artist: 'NastelBom',
    fileName: 'audio_9',
  },
  {
    id: '1_3',
    playlistId: '1',
    index: 3,
    title: 'Epic',
    artist: 'NastelBom',
    fileName: 'audio_10',
  },
];

export const TRACK_MAP = new Map<string, Track>(
  ALL_TRACKS.map((track) => [track.id, track])
);

export const PLAYLIST_MAP = ALL_TRACKS.reduce((map, track) => {
  const existing = map.get(track.playlistId) || [];
  map.set(track.playlistId, [...existing, track]);
  return map;
}, new Map<string, Track[]>());
