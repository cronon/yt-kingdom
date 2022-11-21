import { addTimecodes } from "../addTimecodes";
import { splitTimeUnit } from "../splitTimeUnit";

describe('addTimecodes', () => {
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
  })
})