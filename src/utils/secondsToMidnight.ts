export const secondsToMidnight = (nowMillis: number = Date.now()): number => {
  const now = new Date(nowMillis);
  const then = new Date(now);
  then.setHours(24, 0, 0, 0); // Next midnight
  return Math.floor((then.getTime() - now.getTime()) / 1000);
};
