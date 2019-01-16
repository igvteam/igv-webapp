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
import igv from './igv.esm.min.js';
export function bitlyShortener(accessToken) {

    if (!accessToken || accessToken === "BITLY_TOKEN") {
        return undefined;
    }

    else {

        return function (url) {

            const api = "https://api-ssl.bitly.com/v3/shorten";
            const devIP = "192.168.1.11";

            if (url.startsWith("http://localhost")) {
                url = url.replace("localhost", devIP);
            }  // Dev hack

            let endpoint = api + "?access_token=" + accessToken + "&longUrl=" + encodeURIComponent(url);

            return igv.xhr.loadJson(endpoint, {})

                .then(function (json) {
                    return json.data.url;
                })
        }
    }

}


export function googleShortener(apiKey) {

    if (!apiKey || apiKey === "API_KEY") {
        return undefined;
    }

    else {

        return function (url) {

            const api = "https://www.googleapis.com/urlshortener/v1/url";

            const endpoint = api + "?key=" + apiKey;

            return igv.xhr

                .loadJson(endpoint, {sendData: JSON.stringify({"longUrl": url}), contentType: "application/json"})

                .then(function (json) {

                    return json.id;

                })
        }
    }

}