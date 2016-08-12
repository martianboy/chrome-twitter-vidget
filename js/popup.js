function load_videos(tweet_id) {
	return Twitter.getTweet(tweet_id).then(result => {
		if (result && result.extended_entities) {
			var videos = result.extended_entities.media
				.filter(m => m.type === 'video')
				.map(m => m.video_info.variants
					.filter(v => v.content_type === 'video/mp4')
				);

            console.log(result.extended_entities.media
				.filter(m => m.type === 'video'));

            $$('#media_variants').innerHTML = '';
			$$('#media_variants').appendChild(
                El('ul', videos[0].map(v => El('li',
                    El('a', {
                        href: v.url,
                        target: '_blank'
                    }, `video/mp4 (bitrate: ${v.bitrate})`) 
                )))
            );
		}
	}, error => {
		console.error(error.error);
	});
}

window.onload = function() {
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
};

function init() {
    Settings.init().then(Twitter.init);
}

init();
