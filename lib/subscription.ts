/** Free launch until 15 May 2027 (6 months from Nov 2026). */
export const LAUNCH_FREE_UNTIL = new Date("2027-05-15T23:59:59Z");

export function isLaunchFreePeriod(): boolean {
  return new Date() < LAUNCH_FREE_UNTIL;
}

export function daysLeftInLaunch(): number {
  const ms = LAUNCH_FREE_UNTIL.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}
