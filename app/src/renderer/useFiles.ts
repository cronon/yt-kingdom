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

  albumTemplate: string;
  setAlbumTemplate: (newAlbumTemplate: string) => void;
  albumPreview: string;
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
        id: '1',
        path: cPath + 'Resignostic – Impatiently Doom Waits (Wax Ghosts version).mp3',
        title: 'Resignostic – Impatiently Doom Waits (Wax Ghosts version)',
        duration: '00:03:45',
      },
      {
        id: '2',
        // path: cPath + 'Camellia (Feat. Nanahira) - ベースラインやってる？笑 (Can I Friend You On Bassbook Lol).mp3',
        path: cPath + 'sample027.mp3',
        title: 'Camellia (Feat. Nanahira) - ベースラインやってる？笑 (Can I Friend You On Bassbook Lol)',
        duration: '00:04:47',
      }] as Song[],
      picture: {ext: 'png', base64: '', path: cPath + 'cover.jpg'},
      songTemplate: `Kiara - %track%
Mustard seed (2021)
https://soundcloud.com/kiarabirth`,
      albumTemplate: `Mustard seed (2021)
https://soundcloud.com/kiarabirth
#electronic #ambient #dungeonSynth

%playlist%`
    }
  } else {
    return {
      isLoading: false,
      songs: [],
      picture: {ext: 'png', base64: '', path: ''},
      songTemplate: '',
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

  const [albumTemplate, setAlbumTemplate] = useState(defaultData.albumTemplate);
  const timecodesString = timecodes(songs).reduce((result, {title, timecode}) => {
    return result + '\n' + timecode + ' ' + title;
  }, '');
  const albumPreview = albumTemplate.replaceAll('%playlist%', timecodesString);


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
      // const mp4Paths = await window.electronApi.convertSongs({songs, picture});
      const mp4Paths = [
        "C:\\Users\\HP-PC\\Documents\\pet\\uploader\\app\\temp\\Resignostic – Impatiently Doom Waits (Wax Ghosts version).mp3.mp4",
        "C:\\Users\\HP-PC\\Documents\\pet\\uploader\\app\\temp\\Camellia (Feat. Nanahira) - ベースラインやってる？笑 (Can I Friend You On Bassbook Lol).mp3.mp4"
    ]
      // const totalMp4 = await window.electronApi.concatVideos({mp4Paths});
      const totalMp4 = `C:\\Users\\HP-PC\\Documents\\pet\\uploader\\app\\temp\\total.mp4`
      const uploadSongs = await Promise.all(mp4Paths.map(async (mp4Path, i) => {
        const title = songs[i].title;
        const description = getSongPreview(songs[i]);
        const {url, err} = await window.electronApi.youtubeUpload({mp4Path, title, description});
        if (err) throw new Error(err);
        return url;
      }))
      console.log(uploadSongs)
    } finally {
      setIsLoading(false);
    }

  }

  return {songs, addFilesDialog, picture, startConvert, convertAndUpload,
    songTemplate, setSongTemplate, songPreview,
    albumTemplate, setAlbumTemplate, albumPreview}
}
