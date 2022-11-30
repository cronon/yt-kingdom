import { LongTime } from "common/song";

export function addLongTimes(timecode: string, duration: string): LongTime  {
  const t1 = parse(timecode);
  const t2 = parse(duration);
  const [s, extraM] = splitTimeUnit(t1.s + t2.s);
  const [m, extraH] = splitTimeUnit(t1.m + t2.m + extraM);
  const h = t1.h + t2.h + extraH;

  const ss = tt(s), mm = tt(m), hh = tt(h);
  return [hh, mm, ss].join(':')
}
export function addTimecodes(timecode: string, duration: string): string {
  const t1 = parse(timecode);
  const t2 = parse(duration);
  const [s, extraM] = splitTimeUnit(t1.s + t2.s);
  const [m, extraH] = splitTimeUnit(t1.m + t2.m + extraM);
  const h = t1.h + t2.h + extraH;

  const ss = tt(s), mm = tt(m), hh = tt(h);
  if (h === 0)
    return mm + ':' + ss;
  else
    return hh + ':' + mm + ':' + ss;
}

function parse(timecode: string) {
  const chunks = timecode.split(':');
  if (chunks.length === 2) {
    return { h: 0, m: +chunks[0], s: +chunks[1] };
  } else {
    return { h: +chunks[0], m: +chunks[1], s: +chunks[2] };
  }
}
// prepend zero if necessary, turn h into hh
function tt(t: number): string {
  if (t < 10)
    return '0' + t;
  else
    return t.toString();
}


/**
 * 70 returns 10 result, 1 bigger unit
 */
 export function splitTimeUnit(t: number): [number, number] {
  const unit = t % 60;
  const nextUnit = Math.floor((t - unit) / 60);
  return [unit, nextUnit];
}
