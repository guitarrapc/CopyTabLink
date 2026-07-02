export async function getActiveTabId(): Promise<number> {
  const [activeTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  if (!activeTab?.id) {
    throw new Error("No active tab found.");
  }

  return activeTab.id;
}
