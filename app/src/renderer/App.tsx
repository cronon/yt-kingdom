import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';
import {useState, useEffect, useRef} from 'react';
import { Song } from 'common/song';
import { timecodes } from './components/Timecodes/timecodes';
import { Picture } from 'common/picture';
import { PictureShow } from './components/PictureShow/PictureShow';
import { useFiles } from './useFiles';
import { useLogin } from './useLogin';

const showMockData = true;
function getDefaultData(showMockData: boolean) {
  if (showMockData) {
    return {
      isLoading: false,
    }
  } else {
    return {
      isLoading: false,
    }
  }
}

function useLogs() {
  const [logs, setLogs] = useState<string[]>(['']);
  useEffect(() => {
    window.electronApi.onLogs((log: string) => {
      setLogs(prevLogs => {
        return prevLogs.concat(log);
      })
    });
  }, []);
  const stringLogs = logs.join('\n')
  return {logs: stringLogs};
}

const Main = () => {
  const defaultData = getDefaultData(showMockData);
  const [isLoading, setIsLoading] = useState(defaultData.isLoading);
  const {songs, addFilesDialog, picture, startConvert, convertAndUpload,
    songTemplate, setSongTemplate, songPreview,
    albumTemplate, setAlbumTemplate, albumPreview,
    albumName, setAlbumName,
    uploadAlbum, setUploadAlbum
  } = useFiles({isLoading, setIsLoading, showMockData});

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
            <button disabled={isLoading} onClick={convertAndUpload}>Convert and Upload</button>
          </div>
        </div>
        <div className="y-settings">
            <div className="y-song-settings">
              <div>
                <label>
                  <div>Song description template</div>
                  <textarea value={songTemplate} rows={5} placeholder="Use %track% to place song title" onChange={e => setSongTemplate(e.target.value)} />
                </label>
              </div>
              <div>Preview:</div>
              <div className="y-song-preview">{songPreview}</div>
            </div>
            <div className="y-settings-divider"></div>
            <label>Upload album: <input type="checkbox" checked={uploadAlbum} onChange={e => setUploadAlbum(e.target.checked)} /></label>
            {uploadAlbum &&
            <div className="y-album-settings">
                <label className="y-album-name">
                    Album video and playlist name
                    <input type="text" value={albumName} onChange={e => setAlbumName(e.target.value)}/>
                </label>
                <label>
                  <div>Album video description</div>
                  <textarea value={albumTemplate} rows={5} placeholder="Use %playlist% to place song title" onChange={e => setAlbumTemplate(e.target.value)} />
                </label>
              <div>Preview:</div>
              <div className="y-album-preview">{albumPreview}</div>
            </div>}
        </div>
      </div>
      <Statusbar status={'converting 123/123123 5 min left'} />
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
  statusbar: 2,
  globalOverlay: 1
}

function Statusbar({status}: {status: string}) {
  const {logs} = useLogs()
  const [logsOpen, setLogsOpen] = useState(false);
  const statusClass = "y-statusbar " + (logsOpen ? 'y-statusbar-open' : '');
  const logsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logsOpen])
  return <div className={statusClass} style={{zIndex: zIndexes.statusbar}}>
    <div className="y-progressbar">
      Converting 123123/10012312 5 min left
      {!logsOpen && <button onClick={e => setLogsOpen(true)}>&#65085; Show logs</button>}
      {logsOpen && <button onClick={e => setLogsOpen(false)}>︾ Hide logs</button>}
    </div>
    {logsOpen && <div className="y-logs" ref={logsRef}>
      {logs}
    </div>}
  </div>
}

function GlobalOverlay({isLoading}: {isLoading: boolean}) {
  const style = {
    position: 'absolute',
    top: 0,
    bottom: '4.75rem',
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
