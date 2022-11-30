import { LongTime } from "common/song";

/**
 * fraction/total
 * both in hh:mm:ss format
 */
export function durationPercent(fraction: LongTime, total: LongTime) {
  const fractionSeconds = longTimeToSeconds(fraction)
  const totalSeconds = longTimeToSeconds(total)
  if (totalSeconds === 0) {
    return 0
  } else {
    return Math.round(fractionSeconds / totalSeconds * 100);
  }
}

export function longTimeToSeconds(t: LongTime) {
  const [hh, mm, ss] = t.split(':').map(u => parseInt(u));
  return hh*3600 + mm*60 + ss;
}
