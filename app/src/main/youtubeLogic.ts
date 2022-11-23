

export function youtubeLogic(ipcMain: Electron.IpcMain) {
  ipcMain.handle('youtubeLogin', youtubeLogin)
}

async function youtubeLogin(): Promise<{username: string, loginError: string | null}> {
  return {username: 'cronon', loginError: null}
}
