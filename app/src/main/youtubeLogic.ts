
import fs from 'fs';
import path from 'path';
import { google, youtube_v3 } from 'googleapis';
import { authenticate } from './googleAuth';
import { app } from 'electron';
import { OAuth2Client } from 'google-auth-library';

export function youtubeLogic(ipcMain: Electron.IpcMain) {
  ipcMain.handle('youtubeLogin', youtubeLogin);
  ipcMain.handle('youtubeUpload', (event, args) => youtubeUpload(args))
}


// The application should store the refresh token for future use and use the access token to access a Google API. Once the access token expires, the application uses the refresh token to obtain a new one.
let auth: null | OAuth2Client = null;
let youtube: null | youtube_v3.Youtube = null;

async function youtubeLogin(): Promise<{username: string, loginError: string | null}> {
  const secretsPath = path.join(app.getAppPath(), '../.secrets/oauth2.keys.json');



  auth = await authenticate({
    keyfilePath: secretsPath,
    scopes: [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube',
    ],
  });
  const {access_token, refresh_token, scope, token_type, expiry_date} = auth.credentials;
  console.log(auth);
  google.options({auth})
  youtube = google.youtube('v3');
  const response = await youtube.channels.list({
    "part": [
      "snippet"
    ],
    "mine": true
  });
  const channels = response.data.items
  if (!channels || channels.length  === 0) {
    return {username: '', loginError: "Could not find any channels for that request"};
  }
  const username = channels[0]!.snippet!.title!;
  return {username: username, loginError: null}
}

async function youtubeUpload({mp4Path, title, description}: {mp4Path: string, title: string, description: string}): Promise<{url: string, err: string | null}> {
  if (!auth || !youtube) {
    return {url: '', err: 'You\'re not logged in to Youtube'}
  }
  if (!fs.existsSync(mp4Path)) {
    return {url: '', err: `Cannot find file ${mp4Path}`}
  }
  const fileSize = fs.statSync(mp4Path).size;
  // const res = await youtube.videos.insert(
  //   {
  //     part: 'id,snippet,status',
  //     notifySubscribers: false,
  //     requestBody: {
  //       snippet: {
  //         title: 'Node.js YouTube Upload Test',
  //         description: 'Testing YouTube upload via Google APIs Node.js Client',
  //       },
  //       status: {
  //         privacyStatus: 'private',
  //       },
  //     },
  //     media: {
  //       body: fs.createReadStream(fileName),
  //     },
  //   },
  //   {
  //     // Use the `onUploadProgress` event from Axios to track the
  //     // number of bytes uploaded to this point.
  //     onUploadProgress: evt => {
  //       const progress = (evt.bytesRead / fileSize) * 100;
  //       readline.clearLine(process.stdout, 0);
  //       readline.cursorTo(process.stdout, 0, null);
  //       process.stdout.write(`${Math.round(progress)}% complete`);
  //     },
  //   }
  // );

  // console.log(res.data);
  return {url: 'youtube://123.flv'+fileSize+mp4Path, err: null}
}




// }
