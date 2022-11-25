import { Picture } from "common/picture";
import { Song } from "common/song";
import { useState } from "react";
import { timecodes } from "./components/Timecodes/timecodes";

interface UseFiles {
  songs: Song[];
  addFilesDialog: () => void;
  picture: Picture;
  startConvert: () => void;
  convertAndUpload: () => void;

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
      picture: {ext: 'png', base64: '', path: ''},
      songTemplate: '',
      albumName: '',
      albumTemplate: '',
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
      await window.electronApi.convertSongs({songs, picture});
    } finally {
      setIsLoading(false);
    }
  }

  async function convertAndUpload(){
    setIsLoading(true);
    try {
      const mp4Paths = await window.electronApi.convertSongs({songs, picture});
      const albumMp4 = await window.electronApi.concatVideos({mp4Paths});

      // const mp4Paths = [
      //     "C:\\Users\\HP-PC\\Documents\\pet\\uploader\\app\\temp\\Resignostic – Impatiently Doom Waits (Wax Ghosts version).mp3.mp4",
      //     "C:\\Users\\HP-PC\\Documents\\pet\\uploader\\app\\temp\\sample027.mp3.mp4"
      // ]
      // const albumMp4 = `C:\\Users\\HP-PC\\Documents\\pet\\uploader\\app\\temp\\total.mp4`

      // const songIds: string[] = [];
      // for (const mp4Path of mp4Paths) {
      //   const title = songs[i].title;
      //   const description = getSongPreview(songs[i]);
      //   const res = await window.electronApi.youtubeUpload({mp4Path, title, description});
      //   songIds.push(res.id)
      // }

      // const uploadAlbum = await window.electronApi.youtubeUpload({
      //   mp4Path: albumMp4,
      //   title: albumName,
      //   description: albumPreview
      // });
      // const albumId = uploadAlbum.id;

      // const playlistRes = await window.electronApi.youtubeCreatePlaylist({videoIds: songIds, name: albumName})
      // const playlistId = playlistRes.id;

      const playlistId = 'PLTrC-Aycr2aVEdT9THLUs7HRN6yq0KOrp';
      const songIds = ['MsP-LQtTrzk', '9zfExPGaBmM']
      const albumId = 'ab5_c37mg-o';

      const albumLink = 'https://youtu.be/'+albumId;
      const playlistLink = 'https://youtu.be/'+songIds[0]+'?list='+playlistId;

      console.log('albumLink', albumLink)
      console.log('playlistLink', playlistLink)
    } finally {
      setIsLoading(false);
    }

  }

  return {songs, addFilesDialog, picture, startConvert, convertAndUpload,
    songTemplate, setSongTemplate, songPreview,
    albumTemplate, setAlbumTemplate, albumPreview,
    albumName, setAlbumName, uploadAlbum, setUploadAlbum}
}
