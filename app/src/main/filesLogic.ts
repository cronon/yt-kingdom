import { Picture } from "common/picture";
import { Song } from "common/song";
import { dialog } from "electron";
import path from "path";
import shellExec from "shell-exec";
import fs from 'fs';
import {spawn} from 'child_process';

var pathToFfmpeg =  require('ffmpeg-static-electron').path.replace('app.asar', 'app.asar.unpacked');

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

  ipcMain.handle('openFileDialog', fileOpenDialog)
  ipcMain.handle('startConvert', async (event, args: {songs: Song[], picture: Picture}) => {
    const {songs, picture} = args;
    const convertedSongs = await convertSongs(songs, picture);
    return convertedSongs;
  })
}



async function convertSongs(songs: Song[], picture: Picture): Promise<void> {
  const mp4Paths = await Promise.all(songs.map(async song => {
    return convertSong(song.path, picture.path);
  }));
  await concatVideos(mp4Paths);
}

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

async function ffmpegCommand(args: string[], onStdout?: (data: string) => void, onStdErr?: (data: string) => void): Promise<{allstdout: string, allstderr: string}> {
  console.log(pathToFfmpeg + ' ' + args.join(' '));

  const command = spawn(pathToFfmpeg, args);
  let allstdout: string = '';
  let allstderr: string = '';
  return new Promise((res, rej) => {
    command.stdout.on('data', (data: any) => {
      console.log(`stdout: ${data}`);
      allstdout += data;
    });

    command.stderr.on('data', (data: any) => {
      console.log(`stderr: ${data}`);
      allstderr += data;
    });

    command.on('close', (code: any) => {
      console.log(`ffmpeg process exited with code ${code}`);
      if (code === 0) {
        res({
          allstdout,
          allstderr
        })
      } else {
        rej(code);
      }
    });
  })
}
let _id = 0;
function getId() {
  _id +=1;
  return _id.toString();
}

async function fileOpenDialog(event: Electron.IpcMainInvokeEvent, arg: any): Promise<Array<Song | Picture>> {
  const files = dialog.showOpenDialogSync({
    properties: ['openFile', 'multiSelections'],
    filters: [
      {name: 'Supported files', extensions: ['png', 'jpg', 'mp3']}
    ]
  }) || [];
  const parsedFiles: Array<Song | Picture> = await Promise.all(files.map(async filepath => {
    const ext = path.extname(filepath);
    if (ext === '.mp3') {
      const duration = await readMp3(filepath);
      return {id: getId(), path: filepath, duration, title: path.basename(filepath)}
    } else {
      const base64 =  fs.readFileSync(filepath).toString('base64');
      return {path: filepath, base64, ext};
    }

  }))
  return parsedFiles;
}

async function readMp3(filepath: string): Promise<string> {
  const {allstderr: stderr} = await ffmpegCommand([
    // '-v', 'quiet',
    '-stats',
    '-i', filepath,
    '-f', 'null',
    '-'
  ])
  const time = stderr.match(/\d\d\:\d\d:\d\d/)
  if (time) {
    return time[0];
  } else {
    throw new Error('Cant read time from an mp3' + filepath)
  }
}

