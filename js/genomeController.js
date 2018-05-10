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
var app = (function (app) {

    app.GenomeController = function () {
        this.fileReader = new FileReader();
        promisifyFileReader(this.fileReader);
    };

    app.GenomeController.prototype.getGenomes = function (url) {

        var dictionary;

        if (url instanceof File) {

            return this.fileReader
                .readAsTextAsync(url)
                .then(function (result) {
                    var json;

                    json = JSON.parse(result);
                    dictionary = {};
                    dictionary[ json.id ] = json;
                    return dictionary;
                });

        } else {
            return igv.xhr
                .loadJson(url, {})
                .then(function (result) {

                    dictionary = {};
                    if (true === Array.isArray(result)) {
                        result.forEach(function (json) {
                            dictionary[ json.id ] = json;
                        });
                    } else {
                        dictionary[ result.id ] = result;
                    }

                    return dictionary;
                })
        }

    };

    function promisifyFileReader (filereader) {

        function composeAsync (key) {
            return function () {
                var args = arguments;

                return new Promise (function (resolve, reject) {
                    //
                    function resolveHandler () {
                        cleanHandlers();
                        resolve(filereader.result)
                    }
                    function rejectHandler () {
                        cleanHandlers();
                        reject(filereader.error)
                    }
                    function cleanHandlers () {
                        filereader.removeEventListener('load', resolveHandler);
                        filereader.removeEventListener('abort', rejectHandler);
                        filereader.removeEventListener('error', rejectHandler);
                    }

                    // :: ehhhhh
                    filereader.addEventListener('load', resolveHandler);
                    filereader.addEventListener('abort', rejectHandler);
                    filereader.addEventListener('error', rejectHandler);

                    // :: go!
                    filereader[key].apply(filereader, args);
                })
            }
        }
        for (var key in filereader) {
            if (!key.match(/^read/) || typeof filereader[key] !== 'function') {
                continue;
            }
            filereader[key + 'Async'] = composeAsync(key);
        }
    }

    app.GenomeController.defaultGenomeURL = 'https://s3.amazonaws.com/igv.org.genomes/genomes.json';

    return app;
})(app || {});
