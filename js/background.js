var manifest = chrome.runtime.getManifest();

if (chrome.runtime.onInstalled) {
	chrome.runtime.onInstalled.addListener(function() {
		Settings.save(Settings.DEFAULT);
	});
}

function load_videos(tweet_id) {
	return Twitter.getTweet(tweet_id).then(result => {
		if (result && result.extended_entities) {
			var videos = result.extended_entities.media
				.filter(m => m.type === 'video')
				.map(m => m.video_info.variants
					.filter(v => v.content_type === 'video/mp4')
				);

			console.log(videos);
		}
	}, error => {
		console.error(error.error);
	});
}

chrome.pageAction.onClicked.addListener(function() {
	chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
		if (!tabs) {
			console.warn('Active tabs query returned null!');
			return;
		}

		var tab_urls = tabs.map(t => t.url.match(/twitter\.com\/[^\/]+\/status\/([0-9]+)/))
			.filter(m => m && m.length > 1);
		if (tab_urls.length !== 1) {
			console.warn('No one tab could be identified!');
			return;
		}

		load_videos(tab_urls[0][1]);
	});
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if (changeInfo.url) {
		console.log('Tab url updated!');

		var matches = changeInfo.url.match(/twitter\.com\/[^\/]+\/status\/([0-9]+)/);
		if (!matches || matches.length < 2) return;

		chrome.pageAction.show(tabId);
	}
});

function init() {
	Settings.init().then(Twitter.init);
}

init();
