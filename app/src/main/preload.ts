import { Picture } from 'common/picture';
import { Song } from 'common/song';
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';


const electronApi = {
  async openFileDialog(): Promise<Array<Picture | Song>> {
    return ipcRenderer.invoke('openFileDialog')
  },
  async startConvert(params: {songs: Song[], picture: Picture}): Promise<void> {
    return ipcRenderer.invoke('startConvert', params)
  },
  youtubeLogin(): Promise<{username: string, loginError: string | null}> {
    return ipcRenderer.invoke('youtubeLogin')
  }
}
export type ElectronAPI = typeof electronApi;

contextBridge.exposeInMainWorld('electronApi', electronApi)
