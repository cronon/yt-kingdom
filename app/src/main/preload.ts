import { Picture } from 'common/picture';
import { Song } from 'common/song';
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { Auth } from 'common/auth';


const electronApi = {
  async openFileDialog(): Promise<Array<Picture | Song>> {
    return ipcRenderer.invoke('openFileDialog')
  },
  async convertSongs(params: {songs: Song[], picture: Picture}): Promise<string[]> {
    return ipcRenderer.invoke('convertSongs', params)
  },
  async concatVideos(params: {mp4Paths: string[]}): Promise<string> {
    return ipcRenderer.invoke('concatVideos', params)
  },
  async onLoginChange(callback: (auth: Auth) => void) {
    ipcRenderer.on('onLoginChange', (event, auth: Auth) => {
      callback(auth)
    })
  },
  async youtubeLogin(): Promise<{username: string, loginError: string | null}> {
    return ipcRenderer.invoke('youtubeLogin')
  },
  async youtubeUpload(params: {mp4Path: string, title: string, description: string}): Promise<{url: string, err: string | null}> {
    return ipcRenderer.invoke('youtubeUpload', params)
  }

}
export type ElectronAPI = typeof electronApi;

contextBridge.exposeInMainWorld('electronApi', electronApi)
