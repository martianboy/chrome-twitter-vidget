var Twitter = {
    cb: null,
    user: null,

    init() {
        return new Promise(function(resolve, reject) {
            Twitter.user = Settings.properties.username;

            if (!Twitter.cb) {
                Twitter.cb = new Codebird();
                Twitter.cb.setUseProxy(false);
                Twitter.cb.setConsumerKey(Settings.API_KEY, Settings.API_SECRET);
            }

            if (!Twitter.user) {
                Twitter._verifyCredentials().then(
                    result => {
                        Settings.ONLINE = true;
                        resolve(result);
                    },
                    error => {
                        Settings.ONLINE = false;
                        reject(error);
                    }
                );
            }
            else {{
                resolve(Twitter.user);
            }}
        });
    },

    _verifyCredentials() {
        return new Promise(function(resolve, reject) {
            let accessToken = Settings.properties.accessToken;
            let accessTokenSecret = Settings.properties.accessTokenSecret;

            if (accessToken && accessTokenSecret) {
                Twitter.cb.setToken(accessToken, accessTokenSecret);

                Twitter.cb.__call("account_verifyCredentials", {}, (result, rate, error) => {
                    if (result && result.id) {
                        Twitter.user = result;
                        chrome.storage.sync.set({ username: result.screen_name });

                        resolve(result);
                    }
                    else {
                        reject(error);
                    }
                });
            }
            else {
                reject('accessToken');
            }
        });
    },

    requestToken() {
        return new Promise(function(resolve, reject) {
            Twitter.cb.__call(
                "oauth_requestToken",
                {oauth_callback: "oob"},
                wrapCallbackError(reply => {
                    Twitter.cb.setToken(reply.oauth_token, reply.oauth_token_secret);

                    Twitter.cb.__call(
                        "oauth_authorize",
                        {},
                        wrapCallbackError(resolve, reject)
                    );
                }, reject)
            );
        });
    },

    accessToken(pin) {
        return new Promise(function(resolve, reject) {
            Twitter.cb.__call(
                "oauth_accessToken",
                {oauth_verifier: pin},
                wrapCallbackError(reply => {
                    Twitter.cb.setToken(reply.oauth_token, reply.oauth_token_secret);
                    resolve({
                        accessToken: reply.oauth_token,
                        accessTokenSecret: reply.oauth_token_secret
                    });
                }, reject)
            );
        });
    },

    call(endpoint, params) {
        return new Promise(function(resolve, reject) {
            if (Settings.properties.username) {
                Twitter.cb.__call(endpoint, params, wrapCallbackError(resolve, reject));
            }
            else {
                reject({
                    error: 'Not online!'
                });
            }
        });
    },

    getTweet(id) {
        return Twitter.call('statuses_show_ID', { id });
    }
};

function wrapCallbackError(resolve, reject) {
    return function(result, rate, error) {
        if (error) {
            console.error(error.error);
            return reject(error);
        }

        if (result) 
            return resolve(result);
    }
}