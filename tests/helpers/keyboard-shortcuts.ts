export function normalizeRegisteredShortcut(shortcut: string | undefined): string {
  if (!shortcut) {
    return "";
  }

  return shortcut
    .replace(/^⌘⇧/u, "Command+Shift+")
    .replace(/^⌘/u, "Command+")
    .replace(/^⌥/u, "Alt+")
    .replace(/^Option\+/i, "Alt+")
    .replace(/^Alt\+/i, "Alt+");
}

export function isAltShortcut(shortcut: string | undefined, key: "C" | "M"): boolean {
  return normalizeRegisteredShortcut(shortcut) === `Alt+${key}`;
}

export function isChromeDevToolsConflict(shortcut: string | undefined): boolean {
  if (/^⌘⇧/u.test(shortcut ?? "")) {
    return true;
  }
  return /^Command\+Shift\+/i.test(normalizeRegisteredShortcut(shortcut));
}
