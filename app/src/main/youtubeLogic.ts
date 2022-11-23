
import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import { authenticate } from './googleAuth';
import { app } from 'electron';

export function youtubeLogic(ipcMain: Electron.IpcMain) {
  ipcMain.handle('youtubeLogin', youtubeLogin)
}
// The application should store the refresh token for future use and use the access token to access a Google API. Once the access token expires, the application uses the refresh token to obtain a new one.


async function youtubeLogin(): Promise<{username: string, loginError: string | null}> {
  const secretsPath = path.join(app.getAppPath(), '../.secrets/oauth2.keys.json');
  const auth = await authenticate({
    keyfilePath: secretsPath,
    scopes: [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube',
    ],
  });
  const {access_token, refresh_token, scope, token_type, expiry_date} = auth.credentials;
  console.log(auth);
  google.options({auth})
  const youtube = google.youtube('v3');
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



// // initialize the Youtube API library
// const youtube = google.youtube('v3');

// // very basic example of uploading a video to youtube
// async function runSample(fileName) {
//   // Obtain user credentials to use for the request
//   const auth = await authenticate({
//     keyfilePath: path.join(__dirname, '../.secrets/oauth2.keys.json'),
//     scopes: [
//       'https://www.googleapis.com/auth/youtube.upload',
//       'https://www.googleapis.com/auth/youtube',
//     ],
//   });

//   google.options({auth});

//   const fileSize = fs.statSync(fileName).size;
//   console.log('fileSize', fileSize)
//   const res = await youtube.videos.insert(
//     {
//       part: 'id,snippet,status',
//       notifySubscribers: false,
//       requestBody: {
//         snippet: {
//           title: 'Node.js YouTube Upload Test',
//           description: 'Testing YouTube upload via Google APIs Node.js Client',
//         },
//         status: {
//           privacyStatus: 'private',
//         },
//       },
//       media: {
//         body: fs.createReadStream(fileName),
//       },
//     },
//     {
//       // Use the `onUploadProgress` event from Axios to track the
//       // number of bytes uploaded to this point.
//       onUploadProgress: evt => {
//         const progress = (evt.bytesRead / fileSize) * 100;
//         readline.clearLine(process.stdout, 0);
//         readline.cursorTo(process.stdout, 0, null);
//         process.stdout.write(`${Math.round(progress)}% complete`);
//       },
//     }
//   );
//   console.log('\n\n');
//   console.log(res.data);
//   return res.data;
// }
