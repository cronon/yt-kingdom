import { addTimecodes, splitTimeUnit } from "../addTimecodes";
import { timecodes } from "../timecodes";

describe('timecodes', () => {
  it('splitTimeUnit', () => {
    expect(splitTimeUnit(70)).toEqual([10, 1]);
    expect(splitTimeUnit(120)).toEqual([0, 2]);
    expect(splitTimeUnit(55)).toEqual([55, 0]);
  })
  it('add timecodes', () => {
    expect(addTimecodes('00:00', '01:00')).toEqual('01:00');
    expect(addTimecodes('00:50', '01:50')).toEqual('02:40');
    expect(addTimecodes('59:00', '01:00')).toEqual('01:00:00');
    expect(addTimecodes('01:59:59', '00:02')).toEqual('02:00:01');
    expect(addTimecodes('00:20', '01:40')).toEqual('02:00');
    expect(addTimecodes('00:05', '00:01')).toEqual('00:06');
  });
  it('timecodes', () => {
    expect(timecodes([
      {title: 'Song1', duration: '00:00:30'},
      {title: 'Song2', duration: '00:00:30'},
      {title: 'Song3', duration: '00:00:30'},
      {title: 'Song4', duration: '01:00:30'},
      {title: 'Song5', duration: '01:00:30'},
    ])).toEqual([
      {timecode: '00:00', title: 'Song1'},
      {timecode: '00:30', title: 'Song2'},
      {timecode: '01:00', title: 'Song3'},
      {timecode: '01:30', title: 'Song4'},
      {timecode: '01:02:00', title: 'Song5'},
    ])
  })
})
