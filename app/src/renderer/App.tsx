import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';
import {useState, useEffect} from 'react';
import { Song } from 'common/song';
import { Timecodes } from './components/Timecodes/Timecodes';
import { Picture } from 'common/picture';
import { PictureShow } from './components/PictureShow/PictureShow';

const electronApi = window.electronApi;

interface UseModel {
  isLoading: boolean;
  songs: Song[];
  addFilesDialog: () => void;
  picture: Picture;
  startConvert: () => void;
}
const showMockData = true;
const defaultData = getDefaultData();
function getDefaultData() {
  if (showMockData) {
    const cPath = 'C:\\Users\\HP-PC\\Documents\\pet\\uploader\\samples\\'
    return {
      isLoading: false,
      songs: [{
        id: '1',
        path: cPath + 'Resignostic – Impatiently Doom Waits (Wax Ghosts version).mp3',
        title: 'Resignostic – Impatiently Doom Waits (Wax Ghosts version)',
        duration: '03:45',
      },
      {
        id: '2',
        path: cPath + 'Camellia (Feat. Nanahira) - ベースラインやってる？笑 (Can I Friend You On Bassbook Lol).mp3',
        title: 'Camellia (Feat. Nanahira) - ベースラインやってる？笑 (Can I Friend You On Bassbook Lol)',
        duration: '04:47',
      }] as Song[],
      picture: {ext: 'png', base64: '', path: cPath + 'cover.jpg'}
    }
  } else {
    return {
      isLoading: false,
      songs: [],
      picture: {ext: 'png', base64: '', path: ''}
    }
  }
}

let _id = 0;
function getId() {
  _id +=1;
  return _id.toString();
}

function useModel(): UseModel {
  const [isLoading, setIsLoading] = useState(defaultData.isLoading);
  const [songs, setSongs] = useState<Song[]>(defaultData.songs);
  const [picture, setPicture] = useState<Picture>(defaultData.picture);

  const addFilesDialog = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const newFiles = await window.electronApi.openFileDialog();
    setIsLoading(false);

    const songs = newFiles
      .filter((f: any) => !!f.duration)
      .map(s => ({...s, id: getId()})) as Song[];
    setSongs(prevState => prevState.concat(songs));

    const picture = newFiles.filter((f: any) => f.base64)[0] as Picture;
    if (picture) setPicture(picture);
  }

  async function startConvert() {
    setIsLoading(true);
    try {
      await electronApi.startConvert({songs, picture});
    } finally {
      setIsLoading(false);
    }
  }

  return {isLoading, songs, addFilesDialog, picture, startConvert}
}
;;
const Main = () => {
  const {isLoading, songs, addFilesDialog, picture, startConvert} = useModel();

  return (
    <div className="y-main">
      <GlobalOverlay isLoading={isLoading} />
      <div className="y-playlist">
        <PictureShow picture={picture} />
        <Songlist songs={songs} />
        <div>
          <button disabled={isLoading} onClick={addFilesDialog}>Open</button>
          <button disabled={isLoading} onClick={startConvert}>Convert</button>
        </div>
      </div>
      <div className="y-settings">
          <Timecodes songs={songs}/>
      </div>


    </div>
  );
};

function Songlist({songs}: {songs: Song[]}) {
  return <table className="y-songlist">
    <tbody >
        {songs.map((s, i) => <tr key={s.id}>
              <td>{i+1}</td>
              <td>{s.title}</td>
              <td>{s.duration}</td>
          </tr>
        )}
    </tbody>
  </table>
}

const zIndexes = {
  globalOverlay: 1
}
function GlobalOverlay({isLoading}: {isLoading: boolean}) {
  const style = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    background: 'rgba(255,255,255,0.7)',
    zIndex: zIndexes.globalOverlay
  } as const;
  return isLoading ? <div style={style} /> : <></>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
      </Routes>
    </Router>
  );
}
