import { StateCreator } from 'zustand';

import { getAirQuality } from '@/features/air-quality/actions';
import { AirQualityData } from '@/features/air-quality/types';
import { initialState } from '@/store';
import { logWithTime } from '@/utils';

export interface AirQualitySlice {
  airQualityData: AirQualityData | null;
  airQualityTimestamp: number | null;
  isAirQualityError: boolean;
  isAirQualityFetching: boolean;
  fetchAirQualityData: () => Promise<boolean>;
}

export const airQualitySlice: StateCreator<
  AirQualitySlice,
  [],
  [],
  AirQualitySlice
> = (set, get) => ({
  ...initialState,

  fetchAirQualityData: async () => {
    const { isAirQualityFetching } = get() as AirQualitySlice;
    if (isAirQualityFetching) {
      return true;
    }

    set({
      isAirQualityError: false,
      isAirQualityFetching: true,
    });

    const res = await getAirQuality();

    if (!res.success && res.error) {
      logWithTime(
        `fetchAirQualityData: ${res.error.message ?? 'Unable to retrieve data'}`
      );
    }

    if (res.success && res.data) {
      set({
        airQualityData: res.data,
        airQualityTimestamp: Date.now(),
        isAirQualityFetching: false,
      });
      return true;
    }

    set({
      isAirQualityError: true,
      isAirQualityFetching: false,
    });
    return false;
  },
});
