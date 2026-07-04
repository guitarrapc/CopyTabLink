import { describe, expect, it } from "vitest";
import {
  isAltShortcut,
  isChromeDevToolsConflict,
  normalizeRegisteredShortcut
} from "../helpers/keyboard-shortcuts";

describe("normalizeRegisteredShortcut", () => {
  it("normalizes Windows and Linux shortcut labels", () => {
    expect(normalizeRegisteredShortcut("Alt+C")).toBe("Alt+C");
    expect(normalizeRegisteredShortcut("Alt+M")).toBe("Alt+M");
  });

  it("normalizes macOS shortcut labels", () => {
    expect(normalizeRegisteredShortcut("⌥C")).toBe("Alt+C");
    expect(normalizeRegisteredShortcut("⌥M")).toBe("Alt+M");
    expect(normalizeRegisteredShortcut("Option+C")).toBe("Alt+C");
  });

  it("detects Chrome DevTools conflicts across display formats", () => {
    expect(isChromeDevToolsConflict("Command+Shift+C")).toBe(true);
    expect(isChromeDevToolsConflict("⌘⇧C")).toBe(true);
    expect(isChromeDevToolsConflict("Alt+C")).toBe(false);
    expect(isChromeDevToolsConflict("⌥C")).toBe(false);
  });

  it("accepts Alt/Option shortcuts for copy commands", () => {
    expect(isAltShortcut("Alt+C", "C")).toBe(true);
    expect(isAltShortcut("⌥C", "C")).toBe(true);
    expect(isAltShortcut("Alt+M", "M")).toBe(true);
    expect(isAltShortcut("⌥M", "M")).toBe(true);
  });
});
