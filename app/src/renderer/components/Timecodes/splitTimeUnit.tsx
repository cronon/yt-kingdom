/**
 * 70 returns 10 result, 1 bigger unit
 */
export function splitTimeUnit(t: number): [number, number] {
  const unit = t % 60;
  const nextUnit = Math.floor((t - unit) / 60);
  return [unit, nextUnit];
}
