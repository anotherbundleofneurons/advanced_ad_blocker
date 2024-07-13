let isEnabled = true;

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ isEnabled: true });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getState") {
    sendResponse({ isEnabled: isEnabled });
  } else if (request.action === "toggleEnabled") {
    isEnabled = request.isEnabled;
    chrome.storage.sync.set({ isEnabled: isEnabled }, () => {
      // Notify all tabs about the state change
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, { action: "updateState", isEnabled: isEnabled });
        });
      });
      sendResponse({ success: true });
    });
  }
  return true;
});

// Listen for tab updates to reapply blocking
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.tabs.sendMessage(tabId, { action: "updateState", isEnabled: isEnabled });
  }
});