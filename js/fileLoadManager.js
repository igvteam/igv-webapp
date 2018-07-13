/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2016-2017 The Regents of the University of California
 * Author: Jim Robinson
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * Created by dat on 7/11/18.
 */

var app = (function (app) {

    app.FileLoadManager = function () {

        this.dictionary = {};

        this.keyToIndexExtension =
            {
                bam: { extension: 'bai', optional: false },
                any: { extension: 'idx', optional: true  },
                gz: { extension: 'tbi', optional: true  }
            };

        this.indexExtensionToKey = _.invert(_.mapObject(this.keyToIndexExtension, function (val) {
            return val.extension;
        }));

    };

    app.FileLoadManager.prototype.okHandler = function () {

        var obj;
        obj = this.trackLoadConfiguration();
        if (obj) {

            extractName(obj)
                .then(function (name) {
                    obj.filename = obj.name = name;
                    igv.browser.loadTrackList( [ obj ] );
                })
                .catch(function (error) {
                    // Ignore errors extracting the name
                    console.error(error);
                    igv.browser.loadTrackList( [ obj ] );
                })
        }

    };

    app.FileLoadManager.prototype.inputHandler = function (path, isIndexFile) {
        this.ingestPath(path, isIndexFile);
    };

    app.FileLoadManager.prototype.didDragDrop = function (dataTransfer) {
        var files;

        files = dataTransfer.files;

        return (files && files.length > 0);
    };

    app.FileLoadManager.prototype.dragDropHandler = function (dataTransfer, isIndexFile) {
        var url,
            files,
            isValid;

        url = dataTransfer.getData('text/uri-list');
        files = dataTransfer.files;

        if (files && files.length > 0) {
            this.ingestPath(files[ 0 ], isIndexFile);
        } else if (url && '' !== url) {
            this.ingestPath(url, isIndexFile);
        }

    };

    app.FileLoadManager.prototype.indexName = function () {
        return itemName(this.dictionary.index);
    };

    app.FileLoadManager.prototype.dataName = function () {
        return itemName(this.dictionary.data);
    };

    app.FileLoadManager.prototype.reset = function () {
        this.dictionary = {};
    };

    app.FileLoadManager.prototype.trackLoadConfiguration = function () {
        var extension,
            key,
            config,
            _isIndexFile,
            _isIndexable,
            indexFileStatus;

        if (undefined === this.dictionary.data) {
            this.fileLoadWidget.presentErrorMessage('Error: No data file');
            return undefined;
        } else {


            if (true === app.utils.isJSON(this.dictionary.data)) {
                return this.dictionary.data;
            }

            if (this.dictionary.index) {
                _isIndexFile = isAnIndexFile.call(this, this.dictionary.index);
                if (false === _isIndexFile) {
                    this.fileLoadWidget.presentErrorMessage('Error: index file is not valid.');
                    return undefined;
                }
            }

            _isIndexable = isIndexable.call(this, this.dictionary.data);

            extension = igv.getExtension({ url: this.dictionary.data });

            key = (this.keyToIndexExtension[ extension ]) ? extension : 'any';

            indexFileStatus = this.keyToIndexExtension[ key ];

            if (true === _isIndexable && false === indexFileStatus.optional) {

                if (undefined === this.dictionary.index) {
                    this.fileLoadWidget.presentErrorMessage('Error: index file must be provided.');
                    return undefined;

                } else {
                    return { url: this.dictionary.data, indexURL: this.dictionary.index }
                }

            } else {

                config =
                    {
                        url: this.dictionary.data,
                        indexURL: this.dictionary.index || undefined
                    };

                if (undefined === this.dictionary.index) {
                    config.indexed = false;
                }

                return config;
            }

        }

    };

    app.FileLoadManager.prototype.ingestPath = function (path, isIndexFile) {
        let self = this,
            extension;

        extension = igv.getExtension({ url: path });

        if ('json' === extension || (this.googlePickerFilename && ('json' === igv.getExtension({ url: this.googlePickerFilename })))) {

            igv.xhr
                .loadJson(path)
                .then(function (json) {
                    self.dictionary[ true === isIndexFile ? 'index' : 'data' ] = json;

                })
                .catch(function (e) {
                    console.log('ERROR. FileLoadManager.ingestPath - Invalid JSON');
                });

        } else {
            this.dictionary[ true === isIndexFile ? 'index' : 'data' ] = path;
        }

    };

    function isAnIndexFile(fileOrURL) {
        var extension;

        extension = igv.getExtension({ url: fileOrURL });
        return _.contains(_.keys(this.indexExtensionToKey), extension);
    }

    function itemName (item) {
        return igv.isFilePath(item) ? item.name : item;
    }

    function isIndexable(fileOrURL) {

        var extension;

        if (true === isAnIndexFile(fileOrURL)) {
            return false;
        } else {
            extension = igv.getExtension({ url: fileOrURL });
            return (extension !== 'wig' && extension !== 'seg');
        }

    }

    function extractName(config) {

        var tmp,
            id;

        if (config.name === undefined && igv.isString(config.url) && config.url.includes("drive.google.com")) {
            tmp = extractQuery(config.url);
            id = tmp["id"];

            return igv.Google.getDriveFileInfo(config.url)
                .then(function (json) {
                    return json.originalFilename || json.name;
                })
        } else {
            if (config.name === undefined) {
                return Promise.resolve(extractFilename(config.url));
            } else {
                return Promise.resolve(config.name);
            }
        }

        function extractFilename (urlOrFile) {
            var idx,
                str;

            if (igv.isFilePath(urlOrFile)) {
                return urlOrFile.name;
            } else {

                str = urlOrFile.split('?').shift();
                idx = urlOrFile.lastIndexOf("/");

                return idx > 0 ? str.substring(idx + 1) : str;
            }
        }

        function extractQuery (uri) {
            var i1,
                i2,
                i,
                j,
                s,
                query,
                tokens;

            query = {};
            i1 = uri.indexOf("?");
            i2 = uri.lastIndexOf("#");

            if (i1 >= 0) {
                if (i2 < 0) i2 = uri.length;

                for (i = i1 + 1; i < i2;) {

                    j = uri.indexOf("&", i);
                    if (j < 0) j = i2;

                    s = uri.substring(i, j);
                    tokens = s.split("=", 2);
                    if (tokens.length === 2) {
                        query[tokens[0]] = tokens[1];
                    }

                    i = j + 1;
                }
            }
            return query;
        }

    }

    return app;
}) (app || {});

