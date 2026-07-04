import { test, expect, chromium, type BrowserContext } from "@playwright/test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  isAltShortcut,
  isChromeDevToolsConflict
} from "../helpers/keyboard-shortcuts";

const extensionPath = resolve("dist");

function expectAltShortcut(shortcut: string | undefined, key: "C" | "M"): void {
  expect(isAltShortcut(shortcut, key)).toBe(true);
}

function expectNotChromeDevToolsConflict(shortcut: string | undefined): void {
  expect(isChromeDevToolsConflict(shortcut)).toBe(false);
}

async function getExtensionId(context: BrowserContext): Promise<string> {
  const serviceWorker = context.serviceWorkers()[0] ?? (await context.waitForEvent("serviceworker"));
  return new URL(serviceWorker.url()).host;
}

async function openExtensionPage(context: BrowserContext): Promise<{
  extensionId: string;
  extensionPage: Awaited<ReturnType<BrowserContext["newPage"]>>;
}> {
  const extensionId = await getExtensionId(context);
  const extensionPage = await context.newPage();
  await extensionPage.goto(`chrome-extension://${extensionId}/offscreen.html`);
  return { extensionId, extensionPage };
}

async function launchExtensionContext(locale?: "en" | "ja"): Promise<BrowserContext> {
  const userDataDir = mkdtempSync(join(tmpdir(), "copytablink-e2e-"));
  const lang = locale ?? "en";
  return chromium.launchPersistentContext(userDataDir, {
    channel: "chromium",
    headless: true,
    args: [
      `--lang=${lang}`,
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`
    ]
  });
}

test.describe("copy flow", () => {
  test("copies plain format via background trigger", async () => {
    const context = await launchExtensionContext();
    try {
      const { extensionPage } = await openExtensionPage(context);

      const result = await extensionPage.evaluate(async () => {
        return chrome.runtime.sendMessage({
          type: "__e2e_trigger_copy__",
          format: "plain",
          pageInfo: { title: "Playwright Tab", url: "https://example.com/plain" }
        });
      });
      expect(result.ok).toBe(true);
      expect(result.text).toBe("Playwright Tab https://example.com/plain");
    } finally {
      await context.close();
    }
  });

  test("copies markdown format via background trigger", async () => {
    const context = await launchExtensionContext();
    try {
      const { extensionPage } = await openExtensionPage(context);

      const result = await extensionPage.evaluate(async () => {
        return chrome.runtime.sendMessage({
          type: "__e2e_trigger_copy__",
          format: "markdown",
          pageInfo: { title: "Playwright Tab", url: "https://example.com/markdown" }
        });
      });
      expect(result.ok).toBe(true);
      expect(result.text).toBe("[Playwright Tab](https://example.com/markdown)");
    } finally {
      await context.close();
    }
  });

  test("returns localized messages for current browser locale", async () => {
    const context = await launchExtensionContext("en");
    try {
      const { extensionPage } = await openExtensionPage(context);

      const result = await extensionPage.evaluate(async () => {
        return chrome.runtime.sendMessage({
          type: "__e2e_trigger_copy__",
          format: "plain",
          pageInfo: { title: "Playwright Tab", url: "https://example.com/plain" }
        });
      });
      expect(result.ok).toBe(true);
      expect(result.locale.toLowerCase()).toContain("en");
      expect(result.successMessage).toBe("Copied to clipboard");
      expect(result.errorMessage).toBe("Failed to copy");
    } finally {
      await context.close();
    }
  });
});

test.describe("keyboard shortcuts", () => {
  test("registers Alt+C and Alt+M without Chrome DevTools conflicts", async () => {
    const context = await launchExtensionContext();
    try {
      const { extensionPage } = await openExtensionPage(context);

      const commands = await extensionPage.evaluate(async () => chrome.commands.getAll());
      const plain = commands.find((command) => command.name === "copy-plain");
      const markdown = commands.find((command) => command.name === "copy-markdown");

      expectAltShortcut(plain?.shortcut, "C");
      expectAltShortcut(markdown?.shortcut, "M");
      expectNotChromeDevToolsConflict(plain?.shortcut);
      expectNotChromeDevToolsConflict(markdown?.shortcut);
    } finally {
      await context.close();
    }
  });

  test("executes copy-plain through the command handler", async () => {
    const context = await launchExtensionContext();
    try {
      const { extensionPage } = await openExtensionPage(context);

      const result = await extensionPage.evaluate(async () =>
        chrome.runtime.sendMessage({
          type: "__e2e_trigger_command__",
          command: "copy-plain",
          pageInfo: { title: "Shortcut Tab", url: "https://example.com/plain-shortcut" }
        })
      );

      expect(result.ok).toBe(true);
      expect(result.command).toBe("copy-plain");
      expect(result.text).toBe("Shortcut Tab https://example.com/plain-shortcut");
    } finally {
      await context.close();
    }
  });

  test("executes copy-markdown through the command handler", async () => {
    const context = await launchExtensionContext();
    try {
      const { extensionPage } = await openExtensionPage(context);

      const result = await extensionPage.evaluate(async () =>
        chrome.runtime.sendMessage({
          type: "__e2e_trigger_command__",
          command: "copy-markdown",
          pageInfo: { title: "Shortcut Tab", url: "https://example.com/markdown-shortcut" }
        })
      );

      expect(result.ok).toBe(true);
      expect(result.command).toBe("copy-markdown");
      expect(result.text).toBe("[Shortcut Tab](https://example.com/markdown-shortcut)");
    } finally {
      await context.close();
    }
  });
});
