import { StateCreator } from 'zustand';

import { getLightData } from '@/features/light/actions';
import { updateLightSchedule } from '@/features/light/helpers';
import { LightData } from '@/features/light/types';
import { initialState } from '@/store';
import { logWithTime } from '@/utils';

export interface LightSlice {
  isLightError: boolean;
  isLightFetching: boolean;
  isLightInitialized: boolean;
  lightData: LightData | null;
  lightTimestamp: number | null;
  fetchLightData: () => Promise<boolean>;
  resetLightDataInitialized: () => void;
}

export const lightSlice: StateCreator<LightSlice, [], [], LightSlice> = (
  set,
  get
) => ({
  ...initialState,

  fetchLightData: async () => {
    const { isLightFetching } = get() as LightSlice;
    if (isLightFetching) {
      return true;
    }

    set({
      isLightError: false,
      isLightFetching: true,
    });

    const res = await getLightData();

    if (!res.success && res.error) {
      logWithTime(
        `fetchLightData: ${res.error.message ?? 'Unable to retrieve data'}`
      );

      set({
        isLightError: true,
        isLightFetching: false,
      });
      return false;
    }

    if (res.success && res.data) {
      set({
        isLightFetching: false,
        lightData: updateLightSchedule(res.data),
        lightTimestamp: Date.now(),
        isLightInitialized: true,
      });

      return true;
    } else {
      set({
        isLightError: true,
        isLightFetching: false,
      });
      return false;
    }
  },

  resetLightDataInitialized: () => set({ isLightInitialized: false }),
});
