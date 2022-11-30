import {app} from 'electron';
import path from 'path';

export const isDebug = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';
export const appFolder = isDebug ? app.getAppPath() : path.dirname(process.execPath);
console.log('APP FOLDER', appFolder)
export function getKeys() {
  if (process.env.YT_CLIENT_SECRET) {
    return {
        "client_id": process.env.YT_CLIENT_ID,
        "project_id": process.env.YT_PROJECT_ID,
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_secret": process.env.YT_CLIENT_SECRET,
        "redirect_uris":
        [
            "http://localhost"
        ]
    }
  }
  const secretsPath = path.join(app.getAppPath(), '../.secrets/oauth2.keys.json');
  const keyFile = require(secretsPath);
  const keys = keyFile.installed || keyFile.web;
  return keys;
}
