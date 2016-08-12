var Settings = {
	ONLINE: false,

	UI_TIMEOUT: 2000,

	API_KEY: 'B1ofGEyRBz5OejYZgqmYsE9xj',
	API_SECRET: '7EazJputdSZQ3JWd0lXtlgF9IC6QiV3yWKRpFes7gxaoBa5scT',
	// ACCESS_TOKEN: '2570871-r7YDrv499fsNYarFlwa5Ge95Vkgot4M2zJM2iKDLog',
	// ACCESS_TOKEN_SECRET: 'R9NqYj9fOKR7tP7xYZqT3YiiJqTnvqGKVq7d2JfStVC57',
	ACCESS_TOKEN: null,
	ACCESS_TOKEN_SECRET: null,
	
	AUTH_STATE_LOGIN: 'login',
	AUTH_STATE_PIN: 'pin',
	AUTH_STATE_COMPLETED: 'completed',

	PROPERTIES: [ 'username', 'apiKey', 'apiSecret', 'accessToken', 'accessTokenSecret',
			'authState', 'embedShowMedia', 'embedShowConversation', 'embedIncludeScriptTag' ],

	properties: {},

	init() {
        return new Promise(function(resolve, reject) {
            chrome.storage.sync.get(this.PROPERTIES, function(properties) {
                Settings.properties = properties;
                resolve(properties);
            });
        })
	},

    save(properties) {
        return new Promise(function(resolve, reject) {
            chrome.storage.sync.set(properties, function() {
                for (var key in properties) {
                    Settings.properties[key] = properties[key];
                }
                resolve();
            });
        })
	},

    remove(properties) {
        return new Promise(function(resolve, reject) {
            chrome.storage.sync.remove(properties, function() {
                for (var key in properties) {
                    delete Settings.properties[key];
                }
                resolve();
            });
        })
	}
};

Settings.DEFAULT = {
	 'apiKey' : Settings.API_KEY, 
	 'apiSecret' : Settings.API_SECRET,
	 'accessToken' : Settings.ACCESS_TOKEN, 
	 'accessTokenSecret' : Settings.ACCESS_TOKEN_SECRET,
	 'authState' : Settings.AUTH_STATE_LOGIN,
     'username': null
};
