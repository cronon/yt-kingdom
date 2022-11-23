import { Picture } from 'common/picture';
import { Song } from 'common/song';
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'ipc-example' | 'filesOpened' | 'fileOpen' | 'startConvert';

const electronApi = {
  openFileDialog: () => ipcRenderer.invoke('openFileDialog') as Promise<Array<Picture | Song>>,
  startConvert: (params: {songs: Song[], picture: Picture}): Promise<void> => ipcRenderer.invoke('startConvert', params)
}
export type ElectronAPI = typeof electronApi;

contextBridge.exposeInMainWorld('electronApi', electronApi)
