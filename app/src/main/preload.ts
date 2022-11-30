import { Picture } from 'common/picture';
import { Song } from 'common/song';
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { Auth } from 'common/auth';
import { OnProgress, isDebug } from 'common';



const electronApi = {
  isDebug: isDebug,
  async openFileDialog(onProgress: OnProgress): Promise<Array<Picture | Song>> {
    const cb = (_, file: string) => onProgress(file)
    ipcRenderer.on('openFileDialogProgress', cb);
    return ipcRenderer.invoke('openFileDialog').finally(() => {
      ipcRenderer.off('openFileDialogProgress', cb);
    })
  },

  async convertSong(params: {song: Song, picture: Picture},  onProgress: OnProgress): Promise<string> {
    const cb = (_, file: string) => onProgress(file);
    ipcRenderer.on('convertSongProgress', cb)
    return ipcRenderer.invoke('convertSong', params).finally(() => {
      ipcRenderer.off('convertSongProgress', cb);
    })
  },
  async convertSongStop(): Promise<void> {
    return ipcRenderer.invoke('convertSongStop');
  },
  async concatVideos(params: {mp4Paths: string[]}, onProgress: OnProgress): Promise<string> {
    const cb = (_, file: string) => onProgress(file);
    ipcRenderer.on('concatVideosProgress', cb)
    return ipcRenderer.invoke('concatVideos', params).finally(() => {
      ipcRenderer.off('concatVideosProgress', cb);
    })
  },
  async getChannel(): Promise<{username: string, channelId: string} | null> {
    return ipcRenderer.invoke('getChannel');
  },
  async youtubeLogin(): Promise<{username: string, loginError: string | null}> {
    return ipcRenderer.invoke('youtubeLogin')
  },

  async youtubeUpload(params: {mp4Path: string, title: string, description: string}, onProgress: OnProgress): Promise<{id: string, err: string | null}> {
    const cb = (_, bytes: string) => onProgress(bytes);
    ipcRenderer.on('youtubeUploadProgress', cb);
    return ipcRenderer.invoke('youtubeUpload', params).finally(() => {
      ipcRenderer.off('youtubeUploadProgress', cb);
    });
  },

  async youtubeCreatePlaylist(params: {videoIds: string[], name: string}): Promise<{id: string, err: string | null}> {
    return ipcRenderer.invoke('youtubeCreatePlaylist', params);
  },
  async onLogs(callback: (log: string) => void) {
    ipcRenderer.on('onLogs', (event, log: string) => {
      callback(log);
    })
  }

}
export type ElectronAPI = typeof electronApi;

contextBridge.exposeInMainWorld('electronApi', electronApi)
