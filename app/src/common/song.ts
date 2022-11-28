/**
 * hh:mm:ss format
 */
export type LongTime = string;
/**
 * optional hh:mm:ss format
 */
export type ShortTime = string;
export type SongId = string;
export interface Song {
    path: string;
    title: string;
    duration: LongTime;
    id: SongId;
  }
