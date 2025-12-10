import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { AirQualitySlice, airQualitySlice } from '@/store/airQualitySlice';
import { factsSlice, FactsSlice } from '@/store/factsSlice';
import { layoutSlice, LayoutSlice } from '@/store/layoutSlice';
import { lightSlice, LightSlice } from '@/store/lightSlice';
import { NewsSlice, newsSlice } from '@/store/newsSlice';
import { notesSlice, NotesSlice } from '@/store/notesSlice';
import { DEFAULT_VOLUME } from '@/features/player/constants';
import { playerSlice, PlayerSlice } from '@/store/playerSlice';
import { LoopMode } from '@/features/player/types';

type Store = AirQualitySlice &
  FactsSlice &
  LayoutSlice &
  LightSlice &
  NewsSlice &
  NotesSlice &
  PlayerSlice & {
    reset: () => void;
  };

export const initialState = {
  // Air quality slice
  airQualityData: null,
  airQualityTimestamp: null,
  isAirQualityError: false,
  isAirQualityFetching: false,

  // Facts slice
  fact: null,
  factIDArray: [],
  factsOffset: 0,
  factTimestamp: null,
  isFactsFetching: false,
  isFactsError: false,
  isFactsInitialized: false,

  // Layout slice
  isExtraColumn: true,
  // routeData: null,

  // Light slice
  isLightFetching: false,
  isLightError: false,
  isLightInitialized: false,
  lightData: null,
  lightTimestamp: null,

  // News slice: NewsData API
  isNewsDataError: false,
  isNewsDataFetching: false,
  newsDataArticles: null,
  newsDataNextPage: undefined,
  newsDataTimestamp: null,

  // News slice: Hacker News
  hackerNewsArticles: null,
  hackerNewsTimestamp: null,
  isHackerNewsError: false,
  isHackerNewsFetching: false,

  // Notes slice: Main
  isNotesError: false,
  notesTimestamp: null,

  // Notes slice: Notes
  creatingNote: false,
  isFolderNotesError: false,
  isFolderNotesFetching: false,
  favoriteNotes: [],
  folderNotes: [],
  movingNote: false,
  notes: [],
  removingNote: false,
  updatingNote: false,

  // Notes slice: Folders
  creatingFolder: false,
  fetchingFolders: false,
  folderId: null,
  folders: [],
  removingFolder: false,
  updatingFolder: false,

  // Player
  audioLoopMode: LoopMode.DISABLED,
  audioPlayerVolume: DEFAULT_VOLUME,
  audioTrackDuration: 0,
  audioTrackId: '0_0',
  audioTrackLength: 0,
  browsingPlaylistId: '0',
  isAudioPlaying: false,
  isAudioPlayerLoading: false,
  isAudioPlaylistOpen: true,
  isAutoPlay: false,
};

export const useStore = create<Store>()(
  devtools(
    persist(
      (...a) => ({
        ...airQualitySlice(...a),
        ...factsSlice(...a),
        ...layoutSlice(...a),
        ...lightSlice(...a),
        ...newsSlice(...a),
        ...notesSlice(...a),
        ...playerSlice(...a),
        reset: () => a[0](initialState),
      }),
      {
        name: 'app-store',
        partialize: (state) => ({
          // Air quality
          airQualityData: state.airQualityData,
          airQualityTimestamp: state.airQualityTimestamp,
          // Facts
          fact: state.fact,
          factIDArray: state.factIDArray,
          factsOffset: state.factsOffset,
          isFactsInitialized: state.isFactsInitialized,
          // Layout
          isExtraColumn: state.isExtraColumn,
          // routeData: state.routeData,
          // Light
          lightData: state.lightData,
          lightTimestamp: state.lightTimestamp,
          isLightInitialized: state.isLightInitialized,
          // News
          newsDataArticles: state.newsDataArticles,
          newsDataNextPage: state.newsDataNextPage,
          hackerNewsArticles: state.hackerNewsArticles,
          // Notes
          favoriteNotes: state.favoriteNotes,
          folderId: state.folderId,
          folders: state.folders,
          folderNotes: state.folderNotes,
          // Player
          audioLoopMode: state.audioLoopMode,
          audioPlayerVolume: state.audioPlayerVolume,
          audioTrackDuration: state.audioTrackDuration,
          audioTrackId: state.audioTrackId,
          audioTrackLength: state.audioTrackLength,
          browsingPlaylistId: state.browsingPlaylistId,
          isAudioPlaylistOpen: state.isAudioPlaylistOpen,
          isAutoPlay: state.isAutoPlay,
        }),
      }
    )
  )
);
