import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';
import {useState, useEffect} from 'react';
import { Song } from 'common/song';
import { Timecodes } from './components/Timecodes/Timecodes';
import { Picture } from 'common/picture';
import { PictureShow } from './components/PictureShow/PictureShow';


interface UseModel {
  isLoading: boolean;
  songs: Song[];
  addFilesDialog: () => void;
  picture: Picture;
  startConvert: () => void;
}
function useModel(): UseModel {
  const [isLoading, setIsLoading] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [picture, setPicture] = useState<Picture>({ext: 'png', base64: '', path: ''});

  const addFilesDialog = () => {
    if (isLoading) return;
    setIsLoading(true);
    window.electron.ipcRenderer.once('filesOpened', (newFiles: Array<Song | Picture>) => {
      setIsLoading(false);

      const songs = newFiles.filter((f: any) => !!f.duration) as Song[];
      const picture = newFiles.filter((f: any) => f.base64)[0] as Picture;
      setSongs(prevState => prevState.concat(songs));
      if (picture) setPicture(picture);
      // const picture = newFiles.filter
    });

    window.electron.ipcRenderer.sendMessage('fileOpen', ['open']);
  }

  function startConvert() {
    window.electron.ipcRenderer.sendMessage('startConvert', [{songs, picture}]);
  }

  return {isLoading, songs, addFilesDialog, picture, startConvert}
}
;;
const Main = () => {
  const {isLoading, songs, addFilesDialog, picture, startConvert} = useModel();

  return (
    <div className="y-main">
      <div className="y-playlist">
        <PictureShow picture={picture} />
        {songs.map(s => {
          return <div key={s.path}>
              <div>{s.title}</div>
              <div>{s.duration}</div>
            </div>
        })}
        <div style={{background: isLoading ? 'gray' : '' }}>
          <button disabled={isLoading} onClick={addFilesDialog}>Open</button>
          <button disabled={isLoading} onClick={startConvert}>Convert</button>
        </div>
      </div>
      <div className="y-settings">
          <pre>
            <Timecodes songs={songs}/>
          </pre>
      </div>


    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
      </Routes>
    </Router>
  );
}
