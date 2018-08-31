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

class GoogleURL {

    constructor ({ apiKey, hostname }) {

        this.api = "https://www.googleapis.com/urlshortener/v1/url";

        this.apiKey = apiKey || fetchGoogleApiKey;

        this.hostname = hostname || "goo.gl";

    }

    shortenURL(url) {

        var self = this;

        return this.getApiKey()

            .then(function (key) {

                var endpoint = self.api + "?key=" + key;

                return igv.xhr
                    .loadJson(endpoint, { sendData: JSON.stringify({"longUrl": url}), contentType: "application/json" })
            })
            .then(function (json) {
                return json.id;
            })
    };

    expandURL(url) {

        var self = this;
        return this.getApiKey()

            .then(function (apiKey) {

                var endpoint;

                if (url.includes("goo.gl")) {

                    endpoint = self.api + "?shortUrl=" + url + "&key=" + apiKey;

                    return igv.xhr
                        .loadJson(endpoint, {contentType: "application/json"})
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

    getApiKey() {

        let token;

        if (typeof this.apiKey === "string") {

            return Promise.resolve(this.apiKey);

        } else if (typeof this.apiKey === "function") {

            token = this.apiKey();

            if (typeof token.then === "function") {

                let self = this;
                return token.then(function (key) {
                    self.apiKey = key;
                    return key;
                });

            } else {

                this.apiKey = token;
                return Promise.resolve(token);
            }
        } else {
            throw new Error("Unknown apiKey type: " + this.apiKey);
        }
    }

}

function fetchGoogleApiKey() {
    return igv.xhr
        .loadJson("https://s3.amazonaws.com/igv.org.restricted/google.json", {})
        .then(function (json) {
            return json["apiKey"];
        })
        .catch(function (error) {
            console.error(error);
        })
}

export default GoogleURL;
