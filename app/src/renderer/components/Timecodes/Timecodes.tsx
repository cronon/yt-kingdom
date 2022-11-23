import { Song } from 'common/song';
import { addTimecodes } from './addTimecodes';
import './Timecodes.css';

export function Timecodes({ songs }: { songs: Song[]; }): JSX.Element {
  type Timecode = { timecode: string; title: string; id: string; };
  const timecodes: Timecode[] = songs.reduce((timecodes: Timecode[], song: Song) => {
    if (timecodes.length === 0) {
      return [{ timecode: '00:00', title: song.title, id: song.path }];
    } else {
      const prevTimecode = timecodes[timecodes.length - 1].timecode;
      const prevSongDuration = songs[timecodes.length - 1].duration
      return timecodes.concat({
        timecode: addTimecodes(prevTimecode, prevSongDuration),
        title: song.title,
        id: song.path
      });
    }
  }, [] as Timecode[]);

  return <ol className="y-timecodes">{timecodes.map(t => {
    return <li key={t.id}>
      <time>{t.timecode}</time>
      &nbsp;
      {t.title}
    </li>;
  })}</ol>;
}
