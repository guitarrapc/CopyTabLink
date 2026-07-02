interface CopyRequest {
  type: "copy-to-clipboard";
  text: string;
}

async function writeTextWithFallback(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    // Fallback for environments where clipboard API requires stricter activation.
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  const copied = document.execCommand("copy");
  textarea.remove();

  if (!copied) {
    throw new Error("Clipboard write failed with both APIs.");
  }
}

chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
  const copyRequest = message as Partial<CopyRequest>;
  if (copyRequest.type !== "copy-to-clipboard" || typeof copyRequest.text !== "string") {
    return;
  }

  writeTextWithFallback(copyRequest.text)
    .then(() => sendResponse({ ok: true }))
    .catch((error: unknown) =>
      sendResponse({ ok: false, error: String(error) })
    );
  return true;
});
