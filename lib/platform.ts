/**
 * Does not import Capacitor so the website can be built and served by Vercel
 * without the native runtime being present.
 */
export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;

  const capacitor = (window as Window & {
    Capacitor?: { isNativePlatform?: () => boolean };
  }).Capacitor;

  return capacitor?.isNativePlatform?.() === true;
}
