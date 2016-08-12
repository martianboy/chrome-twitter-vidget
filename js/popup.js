function get_tweet_media(id) {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get('cache:' + id, result => {
			const cached_value = result['cache:' + id];

			if (cached_value && Array.isArray(cached_value))
				resolve(cached_value);
			else
				Twitter.getTweet(id).then(
					result => {
						if (result.extended_entities) {
							const media = result.extended_entities.media;
							chrome.storage.local.set({['cache:' + id]: media});
							resolve(media);
						}
						else {
							reject();
						}
					},
					reject
				);
		});
	});
}

function load_videos(tweet_id) {
	return get_tweet_media(tweet_id).then(
		result => {
			if (result) {
				$$('#media_variants').innerHTML = '';

				for (let media of result) {
					switch(media.type) {
						case 'animated_gif':
						case 'video':
							let videos = media.video_info.variants
									.filter(v => v.content_type === 'video/mp4');
							
							$$('#media_variants').appendChild(
								El('ul', videos.map(v => El('li',
									El('a', {
										href: v.url,
										target: '_blank'
									}, `video/mp4 (bitrate: ${v.bitrate})`) 
								)))
							);
							break;
						case 'photo':
							$$('#media_variants').appendChild(
								El('ul',
									El('li',
										El('a', {
											href: media.media_url_https,
											target: '_blank'
										}, media.display_url) 
									)
								)
							)

							break;
						default:
							break;
					}
				}
			}
		},
		error => {
			console.error(error.error);
		}
	);
}

function onLoad() {
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
    Settings.init()
		.then(Twitter.init)
		.then(onLoad)
}

init();
