const OFFSCREEN_DOCUMENT = "offscreen.html";

interface CopyResponse {
  ok: boolean;
  error?: string;
}

export async function writeTextToClipboard(text: string): Promise<void> {
  await ensureOffscreenDocument();
  const response = (await chrome.runtime.sendMessage({
    type: "copy-to-clipboard",
    text
  })) as CopyResponse | undefined;

  if (!response?.ok) {
    throw new Error(response?.error ?? "Failed to write text to clipboard.");
  }
}

async function ensureOffscreenDocument(): Promise<void> {
  const offscreenUrl = chrome.runtime.getURL(OFFSCREEN_DOCUMENT);
  const contexts = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
    documentUrls: [offscreenUrl]
  });

  if (contexts.length > 0) {
    return;
  }

  await chrome.offscreen.createDocument({
    url: OFFSCREEN_DOCUMENT,
    reasons: ["CLIPBOARD"],
    justification: "Write copied tab information to clipboard"
  });
}
