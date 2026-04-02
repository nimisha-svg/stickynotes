// Background service worker
console.log('[Sticky Notes] Background script initialized');

// Set side panel to open on action (icon) click
if (typeof chrome !== 'undefined' && chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error('Error setting panel behavior:', error));
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Sticky Notes] Extension installed');
});