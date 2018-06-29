/*
 *  The MIT License (MIT)
 *
 * Copyright (c) 2016-2017 The Regents of the University of California
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the
 * following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
 * BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

/**
 * Created by dat on 3/8/17.
 */
var app = (function (app) {

    var urlShorteners;

    app.setURLShortener = function (shortenerConfigs) {

        if (!shortenerConfigs || shortenerConfigs === "none") {

        } else {
            urlShorteners = [];
            shortenerConfigs.forEach(function (config) {
                urlShorteners.push(getShortener(config));
            })
        }

        function getShortener(shortener) {
            if (shortener.provider) {
                if (shortener.provider === "google") {
                    return new GoogleURL(shortener);
                }
                else if (shortener.provider === "bitly") {
                    return new BitlyURL(shortener);
                }
                else {
                    igv.presentAlert("Unknown url shortener provider: " + shortener.provider);
                }
            }
            else {    // Custom
                if (typeof shortener.shortenURL === "function" &&
                    typeof shortener.hostname === "string") {
                    return shortener;
                }
                else {
                    igv.presentAlert("URL shortener object must define functions 'shortenURL' and 'expandURL' and string constant 'hostname'")
                }
            }
        }
    }

    app.shortenURL = function (url) {
        if (urlShorteners) {
            return urlShorteners[0].shortenURL(url);
        }
        else {
            return Promise.resolve(url);
        }
    }

    app.sessionURL = function () {

        let surl,
            path,
            idx;

        path = window.location.href.slice();
        idx = path.indexOf("?");

        surl = (idx > 0 ? path.substring(0, idx) : path) + "?sessionURL=blob:" + igv.browser.compressedSession();

        return surl;
    };

    app.shortJuiceboxURL = function (base) {

        var url,
            self = this;

        // TODO: HACK - dat
        url = base + "?sessionURL=blob:";

        url += igv.browser.compressedSession();

        return self.shortenURL(url)

    };

    app.expandURL = function (shortURL) {

        var expander = (shortURL.startsWith("https://goo.gl")) ? new GoogleURL({}) : new BitlyURL({});

        return expander.expandURL(shortURL);

    }

    var BitlyURL = function (config) {
        this.api = "https://api-ssl.bitly.com";
        this.apiKey = config.key || fetchBitlyApiKey;
        this.hostname = config.hostname || "bit.ly";
        this.devIP = "192.168.1.11";   // For development, replace with your IP address. Bitly will not shorten localhost !
    }


    BitlyURL.prototype.shortenURL = function (url) {

        var self = this;

        if (url.startsWith("http://localhost")) url = url.replace("localhost", this.devIP);  // Dev hack

        return getApiKey.call(this)

            .then(function (key) {
                var endpoint = self.api + "/v3/shorten?access_token=" + key + "&longUrl=" + encodeURIComponent(url);

                return igv.xhr.loadJson(endpoint, {})
            })

            .then(function (json) {
                return json.data.url;
            })
    };


    BitlyURL.prototype.expandURL = function (url) {

        var self = this;

        return getApiKey.call(this)

            .then(function (key) {

                var endpoint = self.api + "/v3/expand?access_token=" + key + "&shortUrl=" + encodeURIComponent(url);

                return igv.xhr.loadJson(endpoint, {})
            })

            .then(function (json) {

                var longUrl = json.data.expand[0].long_url;

                // Fix some Bitly "normalization"
                longUrl = longUrl.replace("{", "%7B").replace("}", "%7D");

                return longUrl;

            })
    }


    var GoogleURL = function (config) {
        this.api = "https://www.googleapis.com/urlshortener/v1/url";
        this.apiKey = config.apiKey || fetchGoogleApiKey;
        this.hostname = config.hostname || "goo.gl";
    }

    GoogleURL.prototype.shortenURL = function (url) {

        var self = this;

        return getApiKey.call(this)

            .then(function (key) {

                var endpoint = self.api + "?key=" + key;

                return igv.xhr.loadJson(endpoint,
                    {
                        sendData: JSON.stringify({"longUrl": url}),
                        contentType: "application/json"
                    })
            })
            .then(function (json) {
                return json.id;
            })
    }

    GoogleURL.prototype.expandURL = function (url) {

        var self = this;
        return getApiKey.call(this)

            .then(function (apiKey) {

                var endpoint;

                if (url.includes("goo.gl")) {

                    endpoint = self.api + "?shortUrl=" + url + "&key=" + apiKey;

                    return igv.xhr.loadJson(endpoint, {contentType: "application/json"})
                        .then(function (json) {
                            return json.longUrl;
                        })
                }
                else {
                    // Not a google url or no api key
                    return Promise.resolve(url);
                }
            })
    }

    function getApiKey() {

        var self = this, token;

        if (typeof self.apiKey === "string") {
            return Promise.resolve(self.apiKey);
        }
        else if (typeof self.apiKey === "function") {

            token = self.apiKey();

            if (typeof token.then === "function") {
                return token.then(function (key) {
                    self.apiKey = key;
                    return key;
                })
            } else {
                self.apiKey = token;
                return Promise.resolve(token);
            }
        }
        else {
            throw new Error("Unknown apiKey type: " + this.apiKey);
        }
    }


// Example function for fetching an api key.
    function fetchBitlyApiKey() {
        return igv.xhr.loadJson("https://s3.amazonaws.com/igv.org.restricted/bitly.json", {})
            .then(function (json) {
                return json["apiKey"];
            })
            .catch(function (error) {
                console.error(error);
            })
    }

// Example function for fetching an api key.
    function fetchGoogleApiKey() {
        return igv.xhr.loadJson("https://s3.amazonaws.com/igv.org.restricted/google.json", {})
            .then(function (json) {
                return json["apiKey"];
            })
            .catch(function (error) {
                console.error(error);
            })
    }


    return app;

})
(app || {});
