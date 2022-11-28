import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import {useState, useEffect, useRef} from 'react';

import { PictureShow } from './components/PictureShow/PictureShow';
import { Status, useFiles } from './useFiles';
import { useLogin } from './useLogin';
import { Songlist } from './components/Songlist/Songlist';

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
  const {songs, setSongs, addFilesDialog, picture, startConvert, convertAndUpload,
    songTemplate, setSongTemplate, songPreview,
    albumTemplate, setAlbumTemplate, albumPreview,
    albumName, setAlbumName,
    uploadAlbum, setUploadAlbum,
    status
  } = useFiles({isLoading, setIsLoading, showMockData});

  const songTemplatePlaceholder = `Artist - %track%
Ablum (2022)

#music #electronic
follow on https://soundcloud.com/
%track% keyword will be replaced with the track title.`;
  const albumTemplatePlaceholder = `Artist - Album (2022)

%playlist%
#music #electronic
follow on https://soundcloud.com/

%playlist% keyword will be replaced with the timecodes for the album video.`
  return (
    <div className="y-main">
      <GlobalOverlay isLoading={isLoading} />
      <LoginBar isLoading={isLoading} setIsLoading={setIsLoading} showMockData={showMockData}/>
      <div className="y-stage">
        <div className="y-playlist">
          <PictureShow picture={picture} />
          <Songlist songs={songs} setSongs={setSongs}/>
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
                  <textarea value={songTemplate} rows={6} placeholder={songTemplatePlaceholder} onChange={e => setSongTemplate(e.target.value)} />
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
                    Name of the playlist and the album video
                    <input type="text" placeholder={'Artist - Album (2022)'} value={albumName} onChange={e => setAlbumName(e.target.value)}/>
                </label>
                <label>
                  <div>Album video description</div>
                  <textarea value={albumTemplate} rows={8} placeholder={albumTemplatePlaceholder} onChange={e => setAlbumTemplate(e.target.value)} />
                </label>
              <div>Preview:</div>
              <div className="y-album-preview">{albumPreview}</div>
            </div>}
        </div>
      </div>
      <Statusbar status={status.status} text={status.text} />
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



const zIndexes = {
  statusbar: 2,
  globalOverlay: 1
}

function Statusbar({text, status}: {status: Status, text: string}) {
  const {logs} = useLogs()
  const [logsOpen, setLogsOpen] = useState(false);
  const statusClass = "y-statusbar " + (logsOpen ? 'y-statusbar-open' : '') + ' y-statusbar-'+status;
  const progressbarClass = 'y-progressbar ' + 'y-progressbar-'+status
  const logsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logsOpen])
  return <div className={statusClass} style={{zIndex: zIndexes.statusbar}}>
    <div className={progressbarClass}>
      <span className="y-status-text" title={text}>{text}</span>
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
