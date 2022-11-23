import { ElectronAPI } from 'main/preload';

declare global {
  interface Window {
    electronApi: ElectronAPI;
  }
}

export {};
