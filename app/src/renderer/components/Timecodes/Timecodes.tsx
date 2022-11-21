import { Song } from 'common/song';
import { addTimecodes } from './addTimecodes';

export function Timecodes({ songs }: { songs: Song[]; }): JSX.Element {
  type Timecode = { timecode: string; title: string; id: string; };
  const timecodes: Timecode[] = songs.reduce((timecodes: Timecode[], song: Song) => {
    if (timecodes.length === 0) {
      return [{ timecode: '00:00', title: song.title, id: song.path }];
    } else {
      const prevTimecode = timecodes[timecodes.length - 1].timecode;
      return timecodes.concat({
        timecode: addTimecodes(prevTimecode, song.duration),
        title: song.title,
        id: song.path
      });
    }
  }, [] as Timecode[]);

  return <>{timecodes.map(t => {
    return <div key={t.id}>
      <code>{t.timecode}</code>
      &nbsp;
      {t.title}
    </div>;
  })}</>;
}
