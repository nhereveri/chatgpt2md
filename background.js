let isExtensionRunning = false;

chrome.action.onClicked.addListener((tab) => {
  if (!isExtensionRunning) {
    isExtensionRunning = true;
    chrome.tabs.sendMessage(tab.id, { action: 'executeScript' });
    chrome.action.disable();
  }
});