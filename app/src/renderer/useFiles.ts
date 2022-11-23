import { Picture } from "common/picture";
import { Song } from "common/song";
import { useState } from "react";

interface UseFiles {
  songs: Song[];
  addFilesDialog: () => void;
  picture: Picture;
  startConvert: () => void;
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
        path: cPath + 'Camellia (Feat. Nanahira) - ベースラインやってる？笑 (Can I Friend You On Bassbook Lol).mp3',
        title: 'Camellia (Feat. Nanahira) - ベースラインやってる？笑 (Can I Friend You On Bassbook Lol)',
        duration: '00:04:47',
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

export function useFiles({isLoading, setIsLoading, showMockData}: {showMockData: boolean, isLoading: boolean, setIsLoading: (e: boolean) => void}): UseFiles {
  const defaultData = getDefaultData(showMockData);
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
      await window.electronApi.startConvert({songs, picture});
    } finally {
      setIsLoading(false);
    }
  }

  return {songs, addFilesDialog, picture, startConvert}
}
