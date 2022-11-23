import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';
import {useState, useEffect} from 'react';
import { Song } from 'common/song';
import { Timecodes } from './components/Timecodes/Timecodes';
import { Picture } from 'common/picture';
import { PictureShow } from './components/PictureShow/PictureShow';
import { useFiles } from './useFiles';
import { useLogin } from './useLogin';

const electronApi = window.electronApi;

interface UseModel {
  isLoading: boolean;
  songs: Song[];
  addFilesDialog: () => void;
  picture: Picture;
  startConvert: () => void;
}
const showMockData = true;
function getDefaultData(showMockData: boolean) {
  if (showMockData) {
    return {isLoading: false}
  } else {
    return {isLoading: false}
  }
}




const Main = () => {
  const defaultData = getDefaultData(showMockData);
  const [isLoading, setIsLoading] = useState(defaultData.isLoading);
  const {songs, addFilesDialog, picture, startConvert} = useFiles({isLoading, setIsLoading, showMockData});

  return (
    <div className="y-main">
      <GlobalOverlay isLoading={isLoading} />
      <LoginBar isLoading={isLoading} setIsLoading={setIsLoading} showMockData={showMockData}/>
      <div className="y-stage">
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
    </div>
  );
};

function LoginBar(props: {showMockData: boolean, isLoading: boolean, setIsLoading: (e: boolean) => void}): JSX.Element {
  const {isLoggedIn, username, loginError, login} = useLogin(props);
  const usernameEl = isLoggedIn && <div className="y-username">@{username}</div>;
  const loginButton = !isLoggedIn && <button className="y-login-button " type="button" onClick={login}>Login</button>
  const loginErrorEl = loginError && <div className="y-login-error">Login error: {loginError}</div>
  return <div className="y-login-bar">
    {usernameEl}
    {loginErrorEl}
    {loginButton}
  </div>
}

function Songlist({songs}: {songs: Song[]}) {
  return <table className="y-songlist">
    <tbody >
        {songs.map((s, i) => <tr key={s.id}>
              <td>{i+1}</td>
              <td>{s.title}</td>
              <td>{noZeroHH(s.duration)}</td>
          </tr>
        )}
    </tbody>
  </table>
}
function noZeroHH(timestamp: string) {
  if (timestamp.length === 5) return timestamp
  else if (timestamp.length === 8 && timestamp[0] === '0' && timestamp[1] === '0') return timestamp.slice(3)
  else throw new Error(`Cannot remove leading zeros from a time ${timestamp}`);
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
