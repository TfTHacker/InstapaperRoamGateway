const query = require('querystring');
const OAuth = require('mashape-oauth').OAuth;

class Instapaper {
  constructor(consumerKey, consumerSecret) {
    if (consumerKey == undefined || consumerSecret == undefined) {
      throw new Error('Must provide both consumer key and secret');
    }
    this.instapaperURL = 'https://www.instapaper.com';
    this.oAuthClient = new OAuth({
      consumerKey,
      consumerSecret,
      accessUrl: this.instapaperURL + '/api/1/oauth/access_token',
      signatureMethod: 'HMAC-SHA1',
    });
    this.accountTokenCache = {};
    this.bookmarksCache = {};

    return this;
  }

  setUserCredentials(username, password) {
    if (username == undefined || password == undefined) {
      throw new Error('Must provide both username and password');
    }
    this.username = username;
    this.password = password;
  }

  getOAuthTokenAndSecret() {
    if (this.oAuthClient == undefined) {
      throw new Error('No OAuth client initialized');
    }

    if (this.accountTokenCache[this.username] !== undefined) {
      return Promise.resolve(this.accountTokenCache[this.username]);
    }

    return new Promise((res, rej) => {
      this.oAuthClient.getXAuthAccessToken(
        this.username,
        this.password,
        (err, oauth_token, oauth_token_secret, results) => {
          if (err) return rej(err);
          if (!oauth_token || !oauth_token_secret) {
            err = new Error('Failed to get OAuth access token');
            err.res = res;
            return reject(err);
          }
          const oauth = { token: oauth_token, secret: oauth_token_secret };
          this.accountTokenCache[this.username] = oauth;
          return res(oauth);
        }
      )
    })
  }

  async _request(endpoint, params = {}) {
    if (this.oAuthClient == undefined) {
      throw new Error('No OAuth client initialized');
    }

    const oAuthTokenAndSecret = await this.getOAuthTokenAndSecret();
    return new Promise((res, rej) => {
      const options = {
        url: this.instapaperURL + endpoint,
        oauth_token: oAuthTokenAndSecret.token,
        oauth_token_secret: oAuthTokenAndSecret.secret,
        type: 'application/x-www-form-urlencoded',
        body: query.stringify(params)
      };
      this.oAuthClient.post(options, function (err, data) {
        if (err) return rej(err);
        return res({
          data: JSON.parse(data)
        });
      })
    });
  }
}


module.exports = Instapaper;