import { test, expect, chromium, type BrowserContext } from "@playwright/test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const extensionPath = resolve("dist");

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
      const serviceWorker = context.serviceWorkers()[0] ?? (await context.waitForEvent("serviceworker"));
      const extensionId = new URL(serviceWorker.url()).host;
      const extensionPage = await context.newPage();
      await extensionPage.goto(`chrome-extension://${extensionId}/offscreen.html`);

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
      const serviceWorker = context.serviceWorkers()[0] ?? (await context.waitForEvent("serviceworker"));
      const extensionId = new URL(serviceWorker.url()).host;
      const extensionPage = await context.newPage();
      await extensionPage.goto(`chrome-extension://${extensionId}/offscreen.html`);

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
      const serviceWorker = context.serviceWorkers()[0] ?? (await context.waitForEvent("serviceworker"));
      const extensionId = new URL(serviceWorker.url()).host;
      const extensionPage = await context.newPage();
      await extensionPage.goto(`chrome-extension://${extensionId}/offscreen.html`);

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
