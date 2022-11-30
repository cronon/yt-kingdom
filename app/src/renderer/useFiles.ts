import { Picture } from "common/picture";
import { Song } from "common/song";
import { useState } from "react";
import { timecodes } from "./components/Timecodes/timecodes";

const zip = <A, B>(a: A[], b:B[]) =>  a.map(function(e, i) {
  return [e, b[i]] as ([A, B])
});
export type Status = 'done' | 'inprogress' | 'error';

interface UseFiles {
  songs: Song[];
  setSongs: (songs: Song[]) => void;
  addFilesDialog: () => void;
  picture: Picture;
  startConvert: () => void;
  convertAndUpload: (params: {uploadSongs: boolean, createPlaylist: boolean}) => Promise<{songIds: string[], albumId: string, playlistId: string}>;

  songTemplate: string;
  setSongTemplate: (newSongTemplate: string) => void;
  songPreview: string;

  albumName: string;
  setAlbumName: (newAlbumName: string) => void;
  albumTemplate: string;
  setAlbumTemplate: (newAlbumTemplate: string) => void;
  albumPreview: string;

  uploadAlbum: boolean;
  setUploadAlbum: (newUploadAlbum: boolean) => void;

  status: {
    status: Status;
    text: string;
  };
}

let _id = 0;
function getId() {
  _id +=1;
  return _id.toString();
}

function getDefaultData(showMockData: boolean) {
  if (showMockData) {
    const cPath = 'C:\\Users\\HP-PC\\Documents\\pet\\uploader\\samples\\'
    return {
      isLoading: false,
      songs: [{
        id: '-1',
        path: cPath + 'Resignostic – Impatiently Doom Waits (Wax Ghosts version).mp3',
        title: 'Resignostic – Impatiently Doom Waits (Wax Ghosts version)',
        duration: '00:03:45',
      },
      {
        id: '-2',
        // path: cPath + 'Camellia (Feat. Nanahira) - ベースラインやってる？笑 (Can I Friend You On Bassbook Lol).mp3',
        path: cPath + 'sample027.mp3',
        title: 'Camellia (Feat. Nanahira) - ベースラインやってる？笑 (Can I Friend You On Bassbook Lol)',
        duration: '00:00:27',
      }] as Song[],
      picture: {ext: 'png', base64: '', path: cPath + 'cover.jpg'},
      songTemplate: `Kiara - %track%
Mustard seed (2021)

https://soundcloud.com/kiarabirth`,
      albumName: 'Kiara - Mustard seed (2021)',
      albumTemplate: `https://soundcloud.com/kiarabirth
#electronic #ambient #dungeonSynth

%playlist%`
    }
  } else {
    return {
      isLoading: false,
      songs: [],
      picture: {ext: 'png', base64: '', path: './assets/emptyCover.jpg'},
      songTemplate: `Artist - %track%
  Ablum (2022)

  #music #electronic
  follow on https://soundcloud.com/`,
      albumName: 'Artist - Album (2022)',
      albumTemplate: `Artist - Album (2022)

%playlist%
#music #electronic
follow on https://soundcloud.com/`,
    }
  }
}

export function useFiles({isLoading, setIsLoading, showMockData}: {showMockData: boolean, isLoading: boolean, setIsLoading: (e: boolean) => void}): UseFiles {
  const defaultData = getDefaultData(showMockData);
  const [songs, setSongs] = useState<Song[]>(defaultData.songs);
  const [picture, setPicture] = useState<Picture>(defaultData.picture);

  const [songTemplate, setSongTemplate] = useState(defaultData.songTemplate);
  const getSongPreview = (song: Song) =>  songTemplate.replaceAll('%track%', song.title);
  const songPreview = songs.length === 0 ? songTemplate : getSongPreview(songs[0]);

  const [albumName, setAlbumName] = useState(defaultData.albumName);
  const [albumTemplate, setAlbumTemplate] = useState(defaultData.albumTemplate);
  const timecodesString = timecodes(songs).map(({title, timecode}) => {
    return timecode + ' ' + title;
  }).join('\n')


  const albumPreview = albumTemplate.replaceAll('%playlist%', timecodesString);

  const [uploadAlbum, setUploadAlbum] = useState(true);

  const [status, _setStatus] = useState({text: 'Idle', status: 'done' as Status});
  const setStatus = (text: string, status: Status) => _setStatus({text, status});

  const addFilesDialog = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setStatus('Open file', 'inprogress');
    try {
      const newFiles = await window.electronApi.openFileDialog(
        (processingFile: string) => setStatus('Reading ' + processingFile, 'inprogress')
      );

      const songs = newFiles
        .filter((f: any) => !!f.duration)
        .map(s => ({...s, id: getId()})) as Song[];
      setSongs(prevState => prevState.concat(songs));

      const picture = newFiles.filter((f: any) => f.base64)[0] as Picture;
      if (picture) setPicture(picture);

      setStatus('Idle', 'done');
    } catch (e: any) {
      setStatus(e.toString(), 'error')
    } finally {
      setIsLoading(false);
    }
  }

  async function startConvert() {
    setIsLoading(true);
    try {
      for (const song of songs) {
        setStatus('Converting song '+song.title, 'inprogress');
        await window.electronApi.convertSong({song, picture}, status => setStatus(status, 'inprogress'));
      }
    } finally {
      setStatus('Idle', 'done')
      setIsLoading(false);
    }
  }

  async function convertAndUpload({uploadSongs, createPlaylist}: {uploadSongs: boolean, createPlaylist: boolean}){
    setIsLoading(true);
    const login = await window.electronApi.getChannel();
    if (!login) throw new Error(`Youtube login got expired, please log in again.`);
    try {
      const songsWithMp4: [string, Song][] = []
      for (const song of songs) {
        setStatus('Converting song '+song.title, 'inprogress');
        const mp4Path = await window.electronApi.convertSong({song, picture}, status => setStatus(status, 'inprogress'))
        songsWithMp4.push([mp4Path, song]);
      }

      let albumMp4 = '';
      if (uploadAlbum) {
        setStatus('Concatenating album video', 'inprogress');
        const mp4Paths = songsWithMp4.map(sm => sm[0]);
        albumMp4 = await window.electronApi.concatVideos({mp4Paths}, status => setStatus(status, 'inprogress'));
      }

      // const albumMp4 = `C:\\Users\\HP-PC\\Documents\\pet\\uploader\\app\\temp\\total.mp4`

      const songIds: string[] = [];
      // if (uploadSongs) {
      //   for (const songWithMp4 of songsWithMp4) {
      //     const title = songWithMp4[1].title;
      //     const description = getSongPreview(songWithMp4[1]);
      //     const mp4Path = songWithMp4[0];
      //     setStatus('Uploading ' + title, 'inprogress')
      //     const onProgress = (uploadPercent: string) => setStatus(uploadPercent+' Uploading ' + title, 'inprogress')
      //     const res = await window.electronApi.youtubeUpload({mp4Path, title, description}, onProgress);
      //     songIds.push(res.id)
      //   }
      //   setStatus('Idle', 'done');
      // }
      let albumId = '';

      // if (uploadAlbum) {
      //   setStatus('Uploading album video', 'inprogress')
      //   const onProgress = (uploadPercent: string) => setStatus(uploadPercent + ' Uploading album video', 'inprogress')
      //   const albumUploadRes = await window.electronApi.youtubeUpload({
      //     mp4Path: albumMp4,
      //     title: albumName,
      //     description: albumPreview
      //   }, onProgress);
      //   albumId = albumUploadRes.id;
      //   setStatus('Idle', 'done');
      // }
      let playlistId = '';
      // if (createPlaylist) {
      //   setStatus('Creating playlist', 'inprogress')
      //   const playlistRes = await window.electronApi.youtubeCreatePlaylist({videoIds: songIds, name: albumName})
      //   playlistId = playlistRes.id;
      //   setStatus('Idle', 'done');
      // }

      // const playlistId = 'PLTrC-Aycr2aVEdT9THLUs7HRN6yq0KOrp';
      // const songIds = ['MsP-LQtTrzk', '9zfExPGaBmM']
      // const albumId = 'ab5_c37mg-o';

      const albumLink = 'https://youtu.be/'+albumId;
      const playlistLink = 'https://youtu.be/'+songIds[0]+'?list='+playlistId;

      console.log('albumLink', albumLink)
      console.log('playlistLink', playlistLink)
      return {
        songIds, albumId, playlistId
      }
    } finally {
      setStatus('Idle', 'done')
      setIsLoading(false);
    }

  }

  return {songs, setSongs, addFilesDialog, picture, startConvert, convertAndUpload,
    songTemplate, setSongTemplate, songPreview,
    albumTemplate, setAlbumTemplate, albumPreview,
    albumName, setAlbumName, uploadAlbum, setUploadAlbum,
    status: status
  }
}
