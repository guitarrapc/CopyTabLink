import { commandToFormat, type CopyFormat } from "../adapters/chrome/commands";
import { writeTextToClipboard } from "../adapters/chrome/clipboard";
import {
  readActiveTabPageInfo,
  showCopyToast
} from "../adapters/chrome/scripting";
import { getActiveTabId } from "../adapters/chrome/tabs";
import { formatMarkdown } from "../core/formatters/markdown";
import { formatPlain } from "../core/formatters/plain";
import { normalizePageInfo, type PageInfo } from "../core/pageInfo";

const CONTEXT_MENU_COPY_PLAIN = "context-copy-plain";
const CONTEXT_MENU_COPY_MARKDOWN = "context-copy-markdown";

chrome.action.onClicked.addListener(async () => {
  await runCopyFlow("plain");
});

chrome.runtime.onInstalled.addListener(() => {
  void recreateContextMenus();
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId === CONTEXT_MENU_COPY_PLAIN) {
    await runCopyFlow("plain");
    return;
  }
  if (info.menuItemId === CONTEXT_MENU_COPY_MARKDOWN) {
    await runCopyFlow("markdown");
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  const format = commandToFormat(command);
  if (!format) {
    return;
  }
  await runCopyFlow(format);
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "__e2e_trigger_copy__") {
    return;
  }

  const requestedFormat = message.format === "markdown" ? "markdown" : "plain";
  const requestedPageInfo =
    typeof message.pageInfo?.title === "string" &&
      typeof message.pageInfo?.url === "string"
      ? normalizePageInfo(message.pageInfo as PageInfo)
      : undefined;

  runCopyFlow(requestedFormat, { dryRun: true, pageInfo: requestedPageInfo })
    .then(({ text }) =>
      sendResponse({
        ok: true,
        text,
        locale: chrome.i18n.getUILanguage(),
        successMessage: getMessage("toastCopySuccess", "Copied to clipboard"),
        errorMessage: getMessage("toastCopyFailed", "Failed to copy")
      })
    )
    .catch((error: unknown) =>
      sendResponse({ ok: false, error: String(error) })
    );
  return true;
});

async function runCopyFlow(
  format: CopyFormat,
  options: { dryRun?: boolean; pageInfo?: PageInfo } = {}
): Promise<{ text: string }> {
  let activeTabId: number | undefined;
  try {
    const pageInfo = options.pageInfo ?? (await readPageInfoFromActiveTab((tabId) => {
      activeTabId = tabId;
    }));
    const text = format === "markdown" ? formatMarkdown(pageInfo) : formatPlain(pageInfo);
    if (!options.dryRun) {
      await writeTextToClipboard(text);
      if (typeof activeTabId === "number") {
        await showCopyToast(
          activeTabId,
          getMessage("toastCopySuccess", "Copied to clipboard"),
          "success"
        );
      }
    }
    return { text };
  } catch (error) {
    console.error(error);
    if (!options.dryRun) {
      const toastTabId = activeTabId ?? (await resolveActiveTabIdSilently());
      if (typeof toastTabId === "number") {
        try {
          await showCopyToast(
            toastTabId,
            getMessage("toastCopyFailed", "Failed to copy"),
            "error"
          );
        } catch {
          // Ignore toast failure on restricted pages.
        }
      }
    }
    throw error;
  }
}

async function readPageInfoFromActiveTab(
  onResolvedTabId?: (tabId: number) => void
): Promise<PageInfo> {
  const tabId = await getActiveTabId();
  onResolvedTabId?.(tabId);
  return readActiveTabPageInfo(tabId);
}

async function resolveActiveTabIdSilently(): Promise<number | undefined> {
  try {
    return await getActiveTabId();
  } catch {
    return undefined;
  }
}

async function recreateContextMenus(): Promise<void> {
  await chrome.contextMenus.removeAll();
  chrome.contextMenus.create({
    id: CONTEXT_MENU_COPY_PLAIN,
    title: getMessage("contextCopyPlain", "Copy Title & Link (plain)"),
    contexts: ["page"]
  });
  chrome.contextMenus.create({
    id: CONTEXT_MENU_COPY_MARKDOWN,
    title: getMessage("contextCopyMarkdown", "Copy Title & Link (markdown)"),
    contexts: ["page"]
  });
}

function getMessage(key: string, fallback: string): string {
  return chrome.i18n.getMessage(key) || fallback;
}
