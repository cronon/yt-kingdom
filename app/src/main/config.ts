import {app} from 'electron';
import path from 'path';

export const isDebug = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';
export const appFolder = isDebug ? app.getAppPath() : path.dirname(process.execPath);
