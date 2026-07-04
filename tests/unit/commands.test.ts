import { describe, expect, it } from "vitest";
import manifest from "../../public/manifest.json";
import {
  COMMAND_COPY_MARKDOWN,
  COMMAND_COPY_PLAIN,
  commandToFormat
} from "../../src/adapters/chrome/commands";

type SuggestedKey = string | {
  default?: string;
  mac?: string;
  windows?: string;
  linux?: string;
  chromeos?: string;
};

const CHROME_MAC_RESERVED_SHORTCUTS = [
  "Command+Shift+C",
  "Command+Shift+M",
  "Command+Shift+I",
  "Command+Shift+J"
] as const;

function resolveSuggestedKeys(suggestedKey: SuggestedKey): Record<string, string> {
  if (typeof suggestedKey === "string") {
    return { default: suggestedKey };
  }
  return Object.fromEntries(
    Object.entries(suggestedKey).filter((entry): entry is [string, string] => typeof entry[1] === "string")
  );
}

function resolvePlatformShortcut(suggestedKey: SuggestedKey, platform: string): string | undefined {
  const keys = resolveSuggestedKeys(suggestedKey);
  return keys[platform] ?? keys.default;
}

describe("command mapping", () => {
  it("maps copy commands to formats", () => {
    expect(commandToFormat(COMMAND_COPY_PLAIN)).toBe("plain");
    expect(commandToFormat(COMMAND_COPY_MARKDOWN)).toBe("markdown");
    expect(commandToFormat("unknown")).toBeNull();
  });
});

describe("manifest keyboard shortcuts", () => {
  it("registers copy-plain and copy-markdown with Alt+C and Alt+M defaults", () => {
    const plain = manifest.commands["copy-plain"];
    const markdown = manifest.commands["copy-markdown"];

    expect(plain.suggested_key).toEqual({ default: "Alt+C" });
    expect(markdown.suggested_key).toEqual({ default: "Alt+M" });
  });

  it("does not assign mac shortcuts that conflict with Chrome defaults", () => {
    for (const [commandName, command] of Object.entries(manifest.commands)) {
      const macShortcut = resolvePlatformShortcut(command.suggested_key as SuggestedKey, "mac");
      if (!macShortcut) {
        continue;
      }
      expect(
        CHROME_MAC_RESERVED_SHORTCUTS,
        `${commandName} mac shortcut must not conflict with Chrome: ${macShortcut}`
      ).not.toContain(macShortcut);
    }
  });

  it("uses Alt defaults on mac when mac override is omitted", () => {
    for (const [commandName, command] of Object.entries(manifest.commands)) {
      const keys = resolveSuggestedKeys(command.suggested_key as SuggestedKey);
      expect(keys.mac, `${commandName} should not override mac shortcuts`).toBeUndefined();
      expect(keys.default, `${commandName} default shortcut`).toMatch(/^Alt\+/);
    }
  });
});
