import { durationPercent } from "../durationPercent";

describe('durationPercent', () => {
  it('works', () => {
    expect(durationPercent('05:00:00', '10:00:00')).toEqual(50);
    expect(durationPercent('00:00:30', '00:01:00')).toEqual(50);
    expect(durationPercent('00:00:30', '00:01:30')).toEqual(33);
    expect(durationPercent('00:00:00', '00:01:30')).toEqual(0);
    expect(durationPercent('00:00:00', '00:00:00')).toEqual(0);
  })
})
