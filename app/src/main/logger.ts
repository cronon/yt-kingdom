import fs from 'fs';
export type LogLevel = 'error' | 'info';

class Logger {
  subs: ((level: 'error' | 'info', message: string) => void)[] = [];
  info(...args: string[]) {
    const message = args.join(' ')
    this.subs.forEach(sub => sub('info', message))
  }
  error(...args: string[]) {
    const message = args.join(' ')
    this.subs.forEach(sub => sub('error', message))
  }
}

export const logger = new Logger;
logger.subs.push((level, message) => {
  console[level](message);
});

