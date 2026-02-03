// Background script
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Ruma Wallet installed');
  if (details.reason === 'install') {
    // Open onboarding tab when extension is first installed
    chrome.tabs.create({
      url: chrome.runtime.getURL('onboarding.html')
    });
  }
});

// Add message handler for opening onboarding
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'OPEN_ONBOARDING') {
    chrome.tabs.create({
      url: chrome.runtime.getURL('onboarding.html')
    });
    sendResponse({ success: true });
  }

  if (message.type === 'CLOSE_ONBOARDING_TAB') {
    // Close the current tab (onboarding tab)
    if (sender.tab?.id) {
      chrome.tabs.remove(sender.tab.id);
    }
    sendResponse({ success: true });
  }
});
