import { ShortTime, LongTime } from 'common/song';
import { addTimecodes } from './addTimecodes';

export type Timecode = { timecode: ShortTime; title: string; };
export function timecodes(songs: {title: string, duration: LongTime}[]): Timecode[] {
  const timecodes: Timecode[] = songs.reduce((timecodes, song) => {
    if (timecodes.length === 0) {
      return [{ timecode: '00:00', title: song.title }];
    } else {
      const prevTimecode = timecodes[timecodes.length - 1].timecode;
      const prevSongDuration = songs[timecodes.length - 1].duration
      return timecodes.concat({
        timecode: addTimecodes(prevTimecode, prevSongDuration),
        title: song.title
      });
    }
  }, [] as Timecode[]);

  return timecodes;
}
