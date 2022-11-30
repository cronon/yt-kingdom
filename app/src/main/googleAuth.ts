import {OAuth2Client} from 'google-auth-library';
import http from 'http';
import {URL} from 'url';
import opn from 'open';
import os from 'os';
import keytar from 'keytar';
const destroyer = require('server-destroy');
import {AddressInfo} from 'net';
import { app } from 'electron';
import path from 'path';
import { getKeys } from './config';

const invalidRedirectUri = `The provided keyfile does not define a valid
redirect URI. There must be at least one redirect URI defined, and this sample
assumes it redirects to 'http://localhost:3000/oauth2callback'.  Please edit
your keyfile, and add a 'redirect_uris' section.  For example:
"redirect_uris": [
  "http://localhost:3000/oauth2callback"
]
`;



export interface LocalAuthOptions {
  keyfilePath: string;
  scopes: string[] | string;
}
const keytarRefreshToken = 'yt-kingdom-yt-refresh-token';
const keytarAccessToken = 'yt-kingdom-yt-access-token';
const keytarAccount = os.userInfo().username;
async function saveTokens(params: {refresh_token: string, access_token: string}): Promise<void> {
  await keytar.setPassword(keytarRefreshToken, keytarAccount, params.refresh_token);
  await keytar.setPassword(keytarAccessToken, keytarAccount, params.access_token);
}
async function retrieveTokens(): Promise<{refresh_token: string | null, access_token: string | null}> {
  const refresh_token = await keytar.getPassword(keytarRefreshToken, keytarAccount);
  const access_token = await keytar.getPassword(keytarAccessToken, keytarAccount);
  return {refresh_token, access_token};
}



export async function createAuth(): Promise<{client: OAuth2Client, isLoggedIn: boolean}> {
  const keys = getKeys();
  const client = new OAuth2Client({
    clientId: keys.client_id,
    clientSecret: keys.client_secret,
  });

  const {refresh_token, access_token} = await retrieveTokens();
  let isLoggedIn = false;
  if (refresh_token) {
    // somebody on github recommended to store both
    // https://github.com/googleapis/google-api-nodejs-client/issues/1611#issuecomment-498662217
    client.setCredentials({refresh_token, access_token});
    const newAT = await client.getAccessToken();
    if (newAT) isLoggedIn = true;
  }

  client.on('tokens', async tokens => {
    if (tokens.refresh_token) {
      await saveTokens({refresh_token: tokens.refresh_token, access_token: tokens.access_token || ''});
    }
  });
  return {client, isLoggedIn}
}

// Open an http server to accept the oauth callback. In this
// simple example, the only request to our webserver is to
// /oauth2callback?code=<code>
export async function authenticate(client: OAuth2Client, scopes: string[]): Promise<OAuth2Client> {
  const redirectUri = new URL('http://localhost');

  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const url = new URL(req.url!, 'http://localhost:3000');
        if (url.pathname !== redirectUri.pathname) {
          res.end('Invalid callback URL');
          return;
        }
        const searchParams = url.searchParams;
        if (searchParams.has('error')) {
          res.end('Authorization rejected.');
          reject(new Error(searchParams.get('error')!));
          return;
        }
        if (!searchParams.has('code')) {
          res.end('No authentication code provided.');
          reject(new Error('Cannot read authentication code.'));
          return;
        }

        const code = searchParams.get('code');
        console.log('GOT CODE', code)
        const {tokens} = await client.getToken({
          code: code!,
          redirect_uri: redirectUri.toString(),
        });
        client.credentials = tokens;
        // todo check if it'll work
        // client.setCredentials(tokens)

        resolve(client);
        res.end('Authentication successful! Please close this window and return to the YtKingdom app.');
      } catch (e) {
        reject(e);
      } finally {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (server as any).destroy();
      }
    });

    // Use emphemeral port if not a web client
    const listenPort = 0;
    server.listen(listenPort, () => {
      const address = server.address();
      if (isAddressInfo(address)) {
        redirectUri.port = String(address.port);
      }
      // open the browser to the authorize url to start the workflow
      const authorizeUrl = client.generateAuthUrl({
        redirect_uri: redirectUri.toString(),
        access_type: 'offline',
        scope: scopes.join(' '),
        ack_loopback_shutdown: "2022-08-31"
      } as any);
      opn(authorizeUrl, {wait: false}).then(cp => cp.unref());
    });
    destroyer(server);
  });

}
function isAddressInfo(addr: string | AddressInfo | null): addr is AddressInfo {
  return (addr as AddressInfo).port !== undefined;
}
