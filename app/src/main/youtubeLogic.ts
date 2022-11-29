
import { OnProgress } from 'common';
import fs from 'fs';
import { google, youtube_v3 } from 'googleapis';
import { authenticate, createAuth } from './googleAuth';
import { logger } from './logger';


export function youtubeLogic(ipcMain: Electron.IpcMain, send: (channel: string, ...args: any[]) => void) {
  ipcMain.handle('youtubeLogin', youtubeLogin);
  ipcMain.handle('youtubeUpload', (event, args) => {
    const onProgress = (uploadPercent: string) => send('youtubeUploadProgress', uploadPercent);
    return youtubeUpload(args, onProgress)
  });
  ipcMain.handle('youtubeCreatePlaylist', (event, args) => youtubeCreatePlaylist(args));
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

async function youtubeUpload({mp4Path, title, description}: {mp4Path: string, title: string, description: string}, onProgress: OnProgress): Promise<{id: string, err: string | null}> {
  const {client, isLoggedIn} = await createAuth();
  if (!client || !isLoggedIn) {
    return {id: '', err: 'You\'re not logged in to Youtube'}
  }
  const youtube = await getYoutube();
  if (!fs.existsSync(mp4Path)) {
    return {id: '', err: `Cannot find file ${mp4Path}`}
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
  {
    onUploadProgress: e => {
      logger.info('Uploading on youtube', e.bytesRead);
      onProgress(Math.round(e.bytesRead / fileSize)+'%')
    }
  }
  );
  const id = res.data.id!;
  return {id, err: null}
}

async function youtubeCreatePlaylist({videoIds, name}: {videoIds: string[], name: string}): Promise<{id: string, err: null | string}> {
  const youtube = await getYoutube();
  const playlistRes = await youtube.playlists.insert({
    part: ['id', 'snippet', 'status'],
    requestBody: {
      snippet: {
        title: name
      }
    }
  });
  console.log('Created playlist', playlistRes)

  const playlistId = playlistRes.data.id!;
  for (const videoId of videoIds) {
    const res = await youtube.playlistItems.insert({
      part: ['id', 'snippet', 'status'],
      requestBody: {
        snippet: {
          playlistId,
          resourceId: {
            kind: 'youtube#video',
            videoId
          }
        }
      }
    });
    console.log('playlistItemsInserted', res);
  };

  return {id: playlistId, err: null}
}

// error when creating a playlist without a title
// response: {
//   config: {
//     url: 'https://youtube.googleapis.com/youtube/v3/playlists?part=id&part=snippet&part=status',
//     method: 'POST',
//     userAgentDirectives: [Array],
//     paramsSerializer: [Function (anonymous)],
//     data: [Object],
//     headers: [Object],
//     params: [Object],
//     validateStatus: [Function (anonymous)],
//     retry: true,
//     body: '{"snippet":{}}',
//     responseType: 'json',
//     retryConfig: [Object]
//   },
//   data: { error: [Object] },
//   headers: {
//     'alt-svc': 'h3=":443"; ma=2592000,h3-29=":443"; ma=2592000,h3-Q050=":443"; ma=2592000,h3-Q046=":443"; ma=2592000,h3-Q043=":443"; ma=2592000,quic=":443"; ma=2592000; v="46,43"',
//     'cache-control': 'private',
//     connection: 'close',
//     'content-encoding': 'gzip',
//     'content-type': 'application/json; charset=UTF-8',
//     date: 'Fri, 25 Nov 2022 09:03:06 GMT',
//     server: 'scaffolding on HTTPServer2',
//     'transfer-encoding': 'chunked',
//     vary: 'Origin, X-Origin, Referer',
//     'x-content-type-options': 'nosniff',
//     'x-frame-options': 'SAMEORIGIN',
//     'x-xss-protection': '0'
//   },
//   status: 400,
//   statusText: 'Bad Request',
//   request: {
//     responseURL: 'https://youtube.googleapis.com/youtube/v3/playlists?part=id&part=snippet&part=status'
//   }
// },
// config: {
//   url: 'https://youtube.googleapis.com/youtube/v3/playlists?part=id&part=snippet&part=status',
//   method: 'POST',
//   userAgentDirectives: [ [Object] ],
//   paramsSerializer: [Function (anonymous)],
//   data: { snippet: {} },
//   headers: {
//     'x-goog-api-client': 'gdcl/6.0.3 gl-node/16.15.0 auth/8.7.0',
//     'Accept-Encoding': 'gzip',
//     'User-Agent': 'google-api-nodejs-client/6.0.3 (gzip)',
//     Authorization: 'Bearer ya29.a0AeTM1ieS3dmlokJFfU36gXs8bDGfKKOqL8BUTgIUmf_tms8MaXkSR7RuYNhCPzFxRY8IkAA4_CDGKreOpnHdhvkhnIngpSioOUFX8MT62WuQcRDTGw-yjBk5DFjaqeIaXfoiCNj_eI7pxms5uOa5o__0v2sVaCgYKAeMSARESFQHWtWOmBsOnCF4R_tEEW801OhE3_w0163',
//     'Content-Type': 'application/json',
//     Accept: 'application/json'
//   },
//   params: { part: [Array] },
//   validateStatus: [Function (anonymous)],
//   retry: true,
//   body: '{"snippet":{}}',
//   responseType: 'json',
//   retryConfig: {
//     currentRetryAttempt: 0,
//     retry: 3,
//     httpMethodsToRetry: [Array],
//     noResponseRetries: 2,
//     statusCodesToRetry: [Array]
//   }
// },
// code: 400,
// errors: [
//   {
//     message: 'Must specify playlist title.',
//     domain: 'youtube.playlist',
//     reason: 'playlistTitleRequired'
//   }
// ]
// }


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

// {
//   kind: 'youtube#video',
//   etag: 'W9UjJbNcblits8gBjMjL5mlwFWI',
//   id: 'ab5_c37mg-o',
//   snippet: {
//     publishedAt: '2022-11-25T08:22:49Z',
//     channelId: 'UC8TQpd6N4CMKXi7qNNRfduA',
//     title: 'Kiara - Mustard seed (2021)',
//     description: 'https://soundcloud.com/kiarabirth\n' +
//       '#electronic #ambient #dungeonSynth\n' +
//       '\n' +
//       '00:00 Resignostic ÔÇô Impatiently Doom Waits (Wax Ghosts version)\n' +
//       '03:45 Camellia (Feat. Nanahira) - ÒâÖÒâ╝Òé╣Òâ®ÒéñÒâ│ÒéäÒüúÒüªÒéï´╝ƒþ¼æ (Can I Friend You On Bassbook Lol)',
//     thumbnails: { default: [Object], medium: [Object], high: [Object] },
//     channelTitle: 'Cronon11',
//     categoryId: '10',
//     liveBroadcastContent: 'none',
//     localized: {
//       title: 'Kiara - Mustard seed (2021)',
//       description: 'https://soundcloud.com/kiarabirth\n' +
//         '#electronic #ambient #dungeonSynth\n' +
//         '\n' +
//         '00:00 Resignostic ÔÇô Impatiently Doom Waits (Wax Ghosts version)\n' +
//         '03:45 Camellia (Feat. Nanahira) - ÒâÖÒâ╝Òé╣Òâ®ÒéñÒâ│ÒéäÒüúÒüªÒéï´╝ƒþ¼æ (Can I Friend You On Bassbook Lol)'
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
