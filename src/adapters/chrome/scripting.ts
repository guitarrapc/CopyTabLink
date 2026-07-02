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
