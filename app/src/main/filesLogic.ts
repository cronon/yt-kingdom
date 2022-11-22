import { Picture } from "common/picture";
import { Song } from "common/song";
import { dialog } from "electron";
import path from "path";
import shellExec from "shell-exec";

var pathToFfmpeg =  require('ffmpeg-static-electron').path;
var pathToProbe =  require('ffprobe-static-electron').path;


export function filesLogic(ipcMain: Electron.IpcMain) {
  ipcMain.on('fileOpen', async (event, arg) => {
    const files = dialog.showOpenDialogSync({
      properties: ['openFile', 'multiSelections'],
      filters: [
        {name: 'Supported files', extensions: ['png', 'jpg', 'mp3']}
      ]
    })
    if (files) {
      const parsedFiles: Array<Song | Picture> = await Promise.all(files.map(async filepath => {
        const ext = path.extname(filepath);
        if (ext === '.mp3') {
          const duration = await readMp3(filepath);
          return {path: filepath, duration, title: path.basename(filepath)}
        } else {
          const base64 =  fs.readFileSync(filepath).toString('base64');
          return {path: filepath, base64, ext};
        }

      }))
      event.reply('filesOpened', parsedFiles);
    }
  })

  async function readMp3(filepath: string){
    // TODO check shell escape
    const out = await shellExec(`${pathToFfmpeg} -v quiet -stats -i ${filepath} -f null -`);
    console.log('read from ffmpeg', out)
    const time = out.stderr.match(/\d\d\:\d\d:\d\d/)
    if (time) {
      return time[0];
    } else {
      throw new Error('Cant read time from an mp3' + filepath)
    }
    console.log(time);
    return time;
  }
}
