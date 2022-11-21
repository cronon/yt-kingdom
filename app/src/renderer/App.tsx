import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';
import {useState, useEffect} from 'react';
import { Song } from 'common/song';
import { Timecodes } from './components/Timecodes/Timecodes';


interface UseSongsBackend {
  isLoading: boolean;
  songs: Song[];
  addSongsDialog: () => void;
}
function useSongsBackend(): UseSongsBackend {
  const [isLoading, setIsLoading] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);

  const addSongsDialog = () => {
    if (isLoading) return;
    setIsLoading(true);
    window.electron.ipcRenderer.once('filesOpened', (newSongs: Song[]) => {
      setIsLoading(false);
      setSongs(prevState => prevState.concat(newSongs));
    });
    
    window.electron.ipcRenderer.sendMessage('fileOpen', ['open']);
  }

  return {isLoading, songs, addSongsDialog}
}
;;
const Main = () => {
  const {isLoading, songs, addSongsDialog} = useSongsBackend();

  return (
    <div className="y-main">
      <div className="y-playlist">
        {songs.map(s => {
          return <div key={s.path}>
              <div>{s.title}</div>
              <div>{s.duration}</div>
            </div>
        })}
        <div style={{background: isLoading ? 'gray' : '' }}>
          <button disabled={isLoading} onClick={addSongsDialog}>Open</button>
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
