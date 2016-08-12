var manifest = chrome.runtime.getManifest();

if (chrome.runtime.onInstalled) {
	chrome.runtime.onInstalled.addListener(function() {
		Settings.save(Settings.DEFAULT);
	});
}

chrome.webNavigation.onCompleted.addListener(function(details) {
	var matches = details.url.match(/twitter\.com\/[^\/]+\/status\/([0-9]+)/);

	console.log('webNavigation.onCompleted:', details.url);
	if (!matches || matches.length < 2)
		chrome.pageAction.hide(details.tabId);
	else
		chrome.pageAction.show(details.tabId);
}, {
	url: [{
		hostEquals: 'twitter.com',
		pathContains: '/status/'
	}]
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if (!changeInfo.url) return;

	console.log('tabs.onUpdated:', changeInfo.url);
	var matches = changeInfo.url.match(/twitter\.com\/[^\/]+\/status\/([0-9]+)/);
	if (!matches || matches.length < 2)
		chrome.pageAction.hide(tabId);
	else
		chrome.pageAction.show(tabId);
});
chrome.tabs.onActivated.addListener(function(activeInfo) {
	chrome.tabs.get(activeInfo.tabId, function(tab) {
		console.log('tabs.onActivated:', tab.url);

		var matches = tab.url.match(/twitter\.com\/[^\/]+\/status\/([0-9]+)/);
		if (!matches || matches.length < 2)
			chrome.pageAction.hide(activeInfo.tabId);
		else
			chrome.pageAction.show(activeInfo.tabId);
	});
});

function init() {
	Settings.init().then(Twitter.init);
}

init();
