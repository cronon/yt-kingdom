import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';
import {useState, useEffect} from 'react';
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

const Main = () => {
  const defaultData = getDefaultData(showMockData);
  const [isLoading, setIsLoading] = useState(defaultData.isLoading);
  const {songs, addFilesDialog, picture, startConvert, convertAndUpload,
    songTemplate, setSongTemplate, songPreview,
    albumTemplate, setAlbumTemplate, albumPreview,
    albumName, setAlbumName,
    uploadAlbum, setUploadAlbum} = useFiles({isLoading, setIsLoading, showMockData});

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
      <Statusbar />
    </div>
  );
};

function Statusbar() {
  const [logsOpen, setLogsOpen] = useState(false);
  const statusClass = "y-statusbar " + (logsOpen ? 'y-statusbar-open' : '');
  return <div className={statusClass}>
    <div className="y-progressbar">
      Converting 123123/10012312 5 min left
      {!logsOpen && <button onClick={e => setLogsOpen(true)}>&#65085; Show logs</button>}
      {logsOpen && <button onClick={e => setLogsOpen(false)}>︾ Hide logs</button>}
    </div>
    {logsOpen && <div className="y-logs">
      {`UPLOADPROGERSS 4128768
UPLOADPROGERSS 4194304
UPLOADPROGERSS 4259840
UPLOADPROGERSS 5499043
UPLOADPROGERSS 4325376
UPLOADPROGERSS 4390912
UPLOADPROGERSS 4456448
UPLOADPROGERSS 4521984
UPLOADPROGERSS 4587520
UPLOADPROGERSS 4618151
{
  kind: 'youtube#video',
  etag: 'h6mcMoWML4yotlUnGjJhTChgzYg',
  id: 'MsP-LQtTrzk',
  snippet: {
    publishedAt: '2022-11-25T08:22:49Z',
    channelId: 'UC8TQpd6N4CMKXi7qNNRfduA',
    title: 'Camellia (Feat. Nanahira) - ÒâÖÒâ╝Òé╣Òâ®ÒéñÒâ│ÒéäÒüúÒüªÒéï´╝ƒþ¼æ (Can I Friend You On Bassbook Lol)',
    description: 'Kiara - Camellia (Feat. Nanahira) - ÒâÖÒâ╝Òé╣Òâ®ÒéñÒâ│ÒéäÒüúÒüªÒéï´╝ƒþ¼æ (Can I Friend You On Bassbook Lol)\n' +
      'Mustard seed (2021)\n' +
      '\n' +
      'https://soundcloud.com/kiarabirth',
    thumbnails: { default: [Object], medium: [Object], high: [Object] },
    channelTitle: 'Cronon11',
    categoryId: '10',
    liveBroadcastContent: 'none',
    localized: {
      title: 'Camellia (Feat. Nanahira) - ÒâÖÒâ╝Òé╣Òâ®ÒéñÒâ│ÒéäÒüúÒüªÒéï´╝ƒþ¼æ (Can I Friend You On Bassbook Lol)',
      description: 'Kiara - Camellia (Feat. Nanahira) - ÒâÖÒâ╝Òé╣Òâ®ÒéñÒâ│ÒéäÒüúÒüªÒéï´╝ƒþ¼æ (Can I Friend You On Bassbook Lol)\n' +
        'Mustard seed (2021)\n' +
        '\n' +
        'https://soundcloud.com/kiarabirth'
    }
  },
  status: {
    uploadStatus: 'uploaded',
    privacyStatus: 'private',
    license: 'youtube',
    embeddable: true,
    publicStatsViewable: true
  }
}`}
    </div>}
  </div>
}

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
