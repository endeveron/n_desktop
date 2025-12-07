export type Track = {
  id: string; // '0_0' <playlistIndex>_<trackIndex>
  index: number; // Position within playlist
  title: string;
  artist: string;
  fileName: string;
};

export enum LoopMode {
  DISABLED = 'DISABLED',
  SINGLE = 'SINGLE',
  ALL = 'ALL',
}
