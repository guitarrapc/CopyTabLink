import { commandToFormat, type CopyFormat } from "../adapters/chrome/commands";
import { writeTextToClipboard } from "../adapters/chrome/clipboard";
import { readActiveTabPageInfo } from "../adapters/chrome/scripting";
import { getActiveTabId } from "../adapters/chrome/tabs";
import { formatMarkdown } from "../core/formatters/markdown";
import { formatPlain } from "../core/formatters/plain";
import { normalizePageInfo, type PageInfo } from "../core/pageInfo";

chrome.action.onClicked.addListener(async () => {
  await runCopyFlow("plain");
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
    .then((text) => sendResponse({ ok: true, text }))
    .catch((error: unknown) =>
      sendResponse({ ok: false, error: String(error) })
    );
  return true;
});

async function runCopyFlow(
  format: CopyFormat,
  options: { dryRun?: boolean; pageInfo?: PageInfo } = {}
): Promise<string> {
  try {
    const pageInfo = options.pageInfo ?? (await readPageInfoFromActiveTab());
    const text = format === "markdown" ? formatMarkdown(pageInfo) : formatPlain(pageInfo);
    if (!options.dryRun) {
      await writeTextToClipboard(text);
    }
    return text;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function readPageInfoFromActiveTab(): Promise<PageInfo> {
  const tabId = await getActiveTabId();
  return readActiveTabPageInfo(tabId);
}
