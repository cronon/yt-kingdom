
import fs from 'fs';
import { google, youtube_v3 } from 'googleapis';
import { authenticate, createAuth } from './googleAuth';


export function youtubeLogic(ipcMain: Electron.IpcMain) {
  ipcMain.handle('youtubeLogin', youtubeLogin);
  ipcMain.handle('youtubeUpload', (event, args) => youtubeUpload(args))
}

async function getYoutube(): Promise<youtube_v3.Youtube> {
  const {client, isLoggedIn} = await createAuth()
  if (!isLoggedIn) throw new Error(`Can't access Youtube API while not logged in`)
  google.options({auth: client});
  return google.youtube('v3')
}

export async function getUsername(): Promise<{username: string; loginError: string | null}> {
  const youtube = await getYoutube();
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

async function youtubeLogin(): Promise<{username: string, loginError: string | null}> {
  let {client: auth} = await createAuth();
  auth = await authenticate(auth, [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube',
  ]);
  const {username, loginError} = await getUsername();
  return {username, loginError}
}

async function youtubeUpload({mp4Path, title, description}: {mp4Path: string, title: string, description: string}): Promise<{url: string, err: string | null}> {
  const {client, isLoggedIn} = await createAuth();
  if (!client || !isLoggedIn) {
    return {url: '', err: 'You\'re not logged in to Youtube'}
  }
  const youtube = await getYoutube();
  if (!fs.existsSync(mp4Path)) {
    return {url: '', err: `Cannot find file ${mp4Path}`}
  }
  const fileSize = fs.statSync(mp4Path).size;

  const res = await youtube.videos.insert({
    part: ['id','snippet','status'],
    notifySubscribers: false,
    requestBody: {
      snippet: {
        title: title,
        description: description,
      },
      status: {
        privacyStatus: 'private',
      },
    },
    media: {
      body: fs.createReadStream(mp4Path),
    }
  },
  {onUploadProgress: e => console.log('UPLOADPROGERSS', e.bytesRead)}
  );

    // {
    //   // Use the `onUploadProgress` event from Axios to track the
    //   // number of bytes uploaded to this point.
    //   onUploadProgress: evt => {
    //     const progress = (evt.bytesRead / fileSize) * 100;
    //     readline.clearLine(process.stdout, 0);
    //     readline.cursorTo(process.stdout, 0, null);
    //     process.stdout.write(`${Math.round(progress)}% complete`);
    //   },
    // }

  console.log(res.data);
  return {url: 'youtube://123.flv'+fileSize+mp4Path, err: null}
}
// res.data
// {
//   kind: 'youtube#video',
//   etag: 'fXCTK2S5icyg7LCfXXvqEVIe8SU',
//   id: 'KH_fV2RWYnI',
//   snippet: {
//     publishedAt: '2022-11-24T14:56:39Z',
//     channelId: 'UC8TQpd6N4CMKXi7qNNRfduA',
//     title: 'Camellia (Feat. Nanahira) - ÒâÖÒâ╝Òé╣Òâ®ÒéñÒâ│ÒéäÒüúÒüªÒéï´╝ƒþ¼æ (Can I Friend You On Bassbook Lol)',
//     description: 'Kiara - Camellia (Feat. Nanahira) - ÒâÖÒâ╝Òé╣Òâ®ÒéñÒâ│ÒéäÒüúÒüªÒéï´╝ƒþ¼æ (Can I Friend You On Bassbook Lol)\n' +
//       'Mustard seed (2021)\n' +
//       'https://soundcloud.com/kiarabirth',
//     thumbnails: { default: [Object], medium: [Object], high: [Object] },
//     channelTitle: 'Cronon11',
//     categoryId: '10',
//     liveBroadcastContent: 'none',
//     localized: {
//       title: 'Camellia (Feat. Nanahira) - ÒâÖÒâ╝Òé╣Òâ®ÒéñÒâ│ÒéäÒüúÒüªÒéï´╝ƒþ¼æ (Can I Friend You On Bassbook Lol)',
//       description: 'Kiara - Camellia (Feat. Nanahira) - ÒâÖÒâ╝Òé╣Òâ®ÒéñÒâ│ÒéäÒüúÒüªÒéï´╝ƒþ¼æ (Can I Friend You On Bassbook Lol)\n' +
//         'Mustard seed (2021)\n' +
//         'https://soundcloud.com/kiarabirth'
//     }
//   },
//   status: {
//     uploadStatus: 'uploaded',
//     privacyStatus: 'private',
//     license: 'youtube',
//     embeddable: true,
//     publicStatsViewable: true
//   }
// }
