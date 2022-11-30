export type OnProgress = (status: string) => void;
export const defaultPicture = './emptyCover.jpg'

export const isDebug = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';
