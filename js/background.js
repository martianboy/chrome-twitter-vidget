var manifest = chrome.runtime.getManifest();

function createContextMenuItems() {
	let auth_menu_item_title;
	if (Settings.properties.username)
		auth_menu_item_title = `Logged in as ${Settings.properties.username}`;
	else
		auth_menu_item_title = 'Authenticate';

	chrome.contextMenus.create({
		id: 'twitter_authenticate',
		title: 'Authenticate',
		contexts: ["page_action"],
		onclick() {
			Twitter.requestToken().then(
				auth_url => {
					chrome.tabs.create({
						"url" : auth_url
					});
				},
				error => {

				}
			)
			console.log('authenticate with twitter');
		}
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

// chrome.webNavigation.onCompleted.addListener(function(details) {
	
// }, {
// 	url: [{
// 		urlEquals: 'https://api.twitter.com/oauth/authorize',
// 	}]
// });

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	var type = request.type;

	if (type === 'getPin:done') {
		Twitter.accessToken(request.pin).then(
			result => {
				if (result)
					Settings.save(result)
						.then(
							() => Twitter.init(),
							(error) => {
								console.error(error.error);
							}
						)
						.then(
							() => console.log('Hurray! Twitter authentication done!')
						);
			}
		)
	}
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
	createContextMenuItems();

	Settings.init()
		.then(Twitter.init)
		.then(
			() => console.log("Twitter.init complete"),
			(error) => {
				debugger;
				chrome.contextMenus.update('twitter_authenticate', {
					title: 'Authenticate'
				});

				Twitter.requestToken().then(
					auth_url => {
						chrome.tabs.create({
							"url" : auth_url
						});
					},
					error => {

					}
				);
			}
		);
}

init();
