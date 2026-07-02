interface CopyRequest {
  type: "copy-to-clipboard";
  text: string;
}

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  const copyRequest = message as Partial<CopyRequest>;
  if (copyRequest.type !== "copy-to-clipboard" || typeof copyRequest.text !== "string") {
    return;
  }

  navigator.clipboard
    .writeText(copyRequest.text)
    .then(() => sendResponse({ ok: true }))
    .catch((error: unknown) =>
      sendResponse({ ok: false, error: String(error) })
    );
  return true;
});
