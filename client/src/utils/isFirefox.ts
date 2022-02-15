/**
 * Taken from https://github.com/DamonOehlman/detect-browser
 * @returns boolean
 */
export function isFirefox(): boolean {
  return Boolean(navigator.userAgent.match(/Firefox\/([0-9\.]+)(?:\s|$)/));
}
