var Twitter = {
    cb: null,
    user: null,

    init() {
        return new Promise(function(resolve, reject) {
            if (!Settings.ONLINE) {
                Twitter.user = {};
            }

            if (!Twitter.cb) {
                Twitter.cb = new Codebird();
                Twitter.cb.setUseProxy(false);
                Twitter.cb.setConsumerKey(Settings.API_KEY, Settings.API_SECRET);
            }

            if (!Twitter.user) {
                Twitter._verifyCredentials().then(resolve, reject);
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

                Twitter.cb.__call("account_verifyCredentials", {}, result => {
                    if (result && result.id) {
                        Twitter.user = result;
                        resolve(result);
                    }
                    else {
                        reject();
                    }
                });
            }
            else {
                reject();
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
                        oauth_token: reply.oauth_token,
                        oauth_token_secret: reply.oauth_token_secret
                    });
                }, reject)
            );
        });
    },

    call(endpoint, params) {
        return new Promise(function(resolve, reject) {
            if (Settings.ONLINE) {
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