import { StateCreator } from 'zustand';

import { initialState } from '@/store';

// export type RouteData = {
//   userId: string;
//   path: string;
// };

export interface LayoutSlice {
  isExtraColumn: boolean;
  toggleExtraColumn: () => void;
  // routeData: RouteData | null;
  // setRouteData: (routeData: RouteData) => void;
}

export const layoutSlice: StateCreator<LayoutSlice, [], [], LayoutSlice> = (
  set,
  get
) => ({
  ...initialState,

  // setRouteData: (routeData) => {
  //   set({ routeData });
  // },

  toggleExtraColumn: () => {
    set({
      isExtraColumn: !get().isExtraColumn,
    });
  },
});
