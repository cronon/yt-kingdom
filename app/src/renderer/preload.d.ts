import { Song } from 'common/song';
import { Channels } from 'main/preload';
import { ElectronAPI } from 'main/preload';

declare global {
  interface Window {
    electronApi: ElectronAPI;
    electron: {
      ipcRenderer: {
        sendMessage(channel: Channels, args: unknown[]): void;
        on(
          channel: Channels,
          func: (...args: unknown[]) => void
        ): (() => void) | undefined;
        once(channel: 'songsConverted', func: (songs: Song[]) => void): void;
        once(channel: 'filesOpened', func: (songs: Song[]) => void): void;
        once(channel: Channels, func: (...args: unknown[]) => void): void;
      };
    };
  }
}

export {};
