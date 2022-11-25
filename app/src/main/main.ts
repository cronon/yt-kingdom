/* eslint global-require: off, no-console: off, promise/always-return: off */
process.on('uncaughtException', function (error) {
  console.error(error);
  process.exit(1);
})

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import {filesLogic} from './filesLogic';
import { getUsername, youtubeLogic } from './youtubeLogic';
import { createAuth } from './googleAuth';
import {logger} from './logger';
import { isDebug } from './config';


class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

filesLogic(ipcMain);
youtubeLogic(ipcMain);


const auth = {
  isLoggedIn: false,
  username: null as (null | string),
  loginError: null as (null|string)
}
createAuth().then(async (params) => {
  auth.isLoggedIn = params.isLoggedIn;
  if (auth.isLoggedIn) {
    const {username, loginError} = await getUsername();
    auth.username = username;
    auth.loginError = loginError;
    if (mainWindow) {
      mainWindow.webContents.send('onLoginChange', auth)
    }
  }
});

if (isDebug) {
  require('electron-debug')({ showDevTools: false });
}

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(err => {
    logger.error(err);
    app.exit(1);
  });



async function createWindow() {
  if (isDebug) {
    // https://github.com/electron/electron/issues/32133#issuecomment-1113989944
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.webContents.send('onLoginChange', auth);
  logger.subs.push((level, message) => mainWindow?.webContents.send('onLogs', message))


  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
        mainWindow.show()
        // mainWindow.maximize()
        // mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    // shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

async function installExtensions() {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(logger.error);
};
