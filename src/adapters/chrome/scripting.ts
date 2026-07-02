import { normalizePageInfo, type PageInfo } from "../../core/pageInfo";

function readPageInfo(): PageInfo {
  return {
    title: document.title,
    url: location.href
  };
}

export async function readActiveTabPageInfo(tabId: number): Promise<PageInfo> {
  const injectionResults = await chrome.scripting.executeScript({
    target: { tabId },
    func: readPageInfo
  });
  const firstResult = injectionResults[0]?.result;
  if (!firstResult) {
    throw new Error("Failed to read page info.");
  }
  return normalizePageInfo(firstResult);
}

type ToastVariant = "success" | "error";

function showInPageToast(message: string, variant: ToastVariant): void {
  const toastId = "__copytablink_toast__";
  const existing = document.getElementById(toastId);
  existing?.remove();

  const toast = document.createElement("div");
  toast.id = toastId;
  toast.textContent = message;
  toast.setAttribute("role", "status");
  toast.style.position = "fixed";
  toast.style.right = "24px";
  toast.style.bottom = "24px";
  toast.style.padding = "10px 14px";
  toast.style.borderRadius = "10px";
  toast.style.fontSize = "13px";
  toast.style.fontFamily =
    "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif";
  toast.style.color = "#fff";
  toast.style.background =
    variant === "success" ? "rgba(32, 140, 88, 0.86)" : "rgba(166, 54, 54, 0.9)";
  toast.style.boxShadow = "0 8px 28px rgba(0, 0, 0, 0.28)";
  toast.style.zIndex = "2147483647";
  toast.style.pointerEvents = "none";
  toast.style.opacity = "0";
  toast.style.transition = "opacity 160ms ease-out";

  document.documentElement.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
  });

  window.setTimeout(() => {
    toast.style.opacity = "0";
    window.setTimeout(() => toast.remove(), 180);
  }, 1400);
}

export async function showCopyToast(
  tabId: number,
  message: string,
  variant: ToastVariant
): Promise<void> {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: showInPageToast,
    args: [message, variant]
  });
}
