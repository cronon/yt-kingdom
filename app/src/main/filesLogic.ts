import { Picture } from "common/picture";
import { Song } from "common/song";
import { dialog } from "electron";
import path from "path";
import shellExec from "shell-exec";
import fs from 'fs';
import {spawn} from 'child_process';

var pathToFfmpeg =  require('ffmpeg-static-electron').path;

const tempFolder = {
  path: path.join(__dirname, 'temp'),
  tempPath(file: string) {
    return path.join(this.getFolder(), file);
  },
  getFolder() {
    if (!fs.existsSync(this.path)) {
      fs.mkdirSync(this.path);
    }
    return this.path
  },
  cleanFolder(){

  }
}

export function filesLogic(ipcMain: Electron.IpcMain) {
  ipcMain.on('fileOpen', fileOpen);
  ipcMain.on('startConvert', async (event, args: {songs: Song[], picture: Picture}[]) => {
    const {songs, picture} = args[0];
    const convertedSongs = await convertSongs(songs, picture);
    event.reply('convertedSongs', convertedSongs);
  })
}



async function convertSongs(songs: Song[], picture: Picture): Promise<void> {
  const mp4Paths = await Promise.all(songs.map(async song => {
    return convertSong(song.path, picture.path);
  }));
  console.log('MP$ paths', mp4Paths)
  await concatVideos(mp4Paths);
}
/*
MP$ paths [
  'C:\\Users\\HP-PC\\Documents\\pet\\uploader\\app\\src\\main\\temp\\sample027.mp3.mp4',
  'C:\\Users\\HP-PC\\Documents\\pet\\uploader\\app\\src\\main\\temp\\sample027-reMix).mp3.mp4'
]
*/

// concatVideos([
//   'C:\\Users\\HP-PC\\Documents\\pet\\uploader\\app\\src\\main\\temp\\sample027.mp3.mp4',
//   'C:\\Users\\HP-PC\\Documents\\pet\\uploader\\app\\src\\main\\temp\\sample027-reMix).mp3.mp4'
// ])

async function concatVideos(mp4Paths: string[]): Promise<void> {
  const listFilePath = tempFolder.tempPath('list.txt');
  // file '/mnt/share/file 3'\''.wav'
  const listFileContents = mp4Paths.map(p => `file '${p.replace(/\'/g, `\\'`)}'`).join('\n')
  const listFile = fs.writeFileSync(listFilePath, listFileContents)

  const totalFilePath = tempFolder.tempPath('total.mp4')
  // ffmpeg -f concat -safe 0 -i mylist.txt -c copy output.mp4
  ffmpegCommand([
    '-f', 'concat',
    '-safe', '0',
    '-i', listFilePath,
    '-c', 'copy',
    totalFilePath,
    '-y'
  ],
  (data) => {},
  (stderr) => {}
  )
}

async function convertSong(songPath: string, picturePath: string): Promise<string> {
  const songName = path.basename(songPath);
  const mp4Path = tempFolder.tempPath(songName+'.mp4')
  await ffmpegCommand([
    '-loop', '1',
    '-i', picturePath,
    '-i', songPath,
    '-c:a', 'copy',
    '-c:v', 'libx264',
    '-vf', 'format=yuv420p', // https://trac.ffmpeg.org/wiki/Encode/H.264 encoding for dumb players
    '-y',
    '-shortest', mp4Path,
  ],
    (data) => {},
    (stderr) => {}
  );
  return mp4Path;
}

async function ffmpegCommand(args: string[], onStdout?: (data: string) => void, onStdErr?: (data: string) => void): Promise<void> {
  console.log(pathToFfmpeg + ' ' + args.join(' '));

  const command = spawn(pathToFfmpeg, args);
  return new Promise((res, rej) => {
    command.stdout.on('data', (data: any) => {
      console.log(`stdout: ${data}`);
    });

    command.stderr.on('data', (data: any) => {
      console.error(`stderr: ${data}`);
    });

    command.on('close', (code: any) => {
      console.log(`child process exited with code ${code}`);
      if (code === 0) {
        res()
      } else {
        rej(code);
      }
    });
  })
}

async function fileOpen(event: Electron.IpcMainEvent, arg: any) {
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
}

async function readMp3(filepath: string): Promise<string> {
  // TODO check shell escape
  const out = await shellExec(`${pathToFfmpeg} -v quiet -stats -i ${filepath} -f null -`);
  console.log('read from ffmpeg', out)
  const time = out.stderr.match(/\d\d\:\d\d:\d\d/)
  if (time) {
    return time[0];
  } else {
    throw new Error('Cant read time from an mp3' + filepath)
  }
}

