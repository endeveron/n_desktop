import { StateCreator } from 'zustand';

import { getFact, getFactIDArray } from '@/features/facts/actions';
import { FACT_FETCHING_LIMIT } from '@/features/facts/constants';
import { FactItem } from '@/features/facts/types';
import { initialState } from '@/store';
import { logWithTime } from '@/utils';

export interface FactsSlice {
  fact: FactItem | null;
  factIDArray: string[];
  factsOffset: number;
  factTimestamp: number | null;
  isFactsError: boolean;
  isFactsFetching: boolean;
  isFactsInitialized: boolean;
  fetchFact: (id: string) => Promise<boolean>;
  fetchFactIDArray: (offset?: number) => Promise<boolean>;
  resetFacts: () => void;
  resetFactsInitialized: () => void;
}

export const factsSlice: StateCreator<FactsSlice, [], [], FactsSlice> = (
  set,
  get
) => ({
  ...initialState,

  fetchFact: async (id) => {
    if (!id) {
      return false;
    }

    const { isFactsFetching, isFactsInitialized } = get() as FactsSlice;

    if (!isFactsInitialized || isFactsFetching) {
      return true;
    }

    set({
      isFactsFetching: true,
      isFactsError: false,
    });

    const res = await getFact(id);

    if (!res.success && res.error) {
      logWithTime(
        `fetchFact: ${res.error.message ?? 'Unable to retrieve data'}`
      );

      set({
        isFactsFetching: false,
        isFactsError: true,
      });
      return false;
    }

    if (res.success && res.data) {
      // Remove fact ID from the local factIDArray
      const updFactIDArray = [...get().factIDArray].filter(
        (factId) => factId !== id
      );

      set({
        fact: res.data,
        factIDArray: updFactIDArray,
        factTimestamp: Date.now(),
        isFactsFetching: false,
      });

      return true;
    } else {
      set({
        isFactsError: true,
        isFactsFetching: false,
      });
      return false;
    }
  },

  fetchFactIDArray: async () => {
    const { isFactsFetching } = get() as FactsSlice;
    if (isFactsFetching) {
      return true;
    }

    set({
      isFactsFetching: true,
      isFactsError: false,
    });

    const offset = get().factsOffset;
    const res = await getFactIDArray(offset);

    if (!res.success && res.error) {
      logWithTime(
        `fetchFactIDArray: ${res.error.message ?? 'Unable to retrieve data'}`
      );

      set({
        isFactsFetching: false,
        isFactsError: true,
      });
      return false;
    }

    if (res.success && res.data) {
      set({
        factIDArray: res.data,
        factsOffset: offset + FACT_FETCHING_LIMIT,
        factTimestamp: Date.now(),
        isFactsFetching: false,
        isFactsInitialized: true,
      });
      return true;
    } else {
      set({
        isFactsFetching: false,
        isFactsError: true,
      });
      return false;
    }
  },

  resetFacts: () => {
    set({
      fact: null,
      factIDArray: [],
      factsOffset: 0,
      factTimestamp: null,
      isFactsFetching: false,
      isFactsError: false,
    });
  },

  resetFactsInitialized: () => set({ isFactsInitialized: false }),
});
