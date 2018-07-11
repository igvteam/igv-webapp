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

    app.FileLoadManager.prototype.didDragFile = function (dataTransfer) {
        var files;

        files = dataTransfer.files;

        return (files && files.length > 0);
    };

    app.FileLoadManager.prototype.ingestDataTransfer = function (dataTransfer, isIndexFile) {
        var url,
            files;

        url = dataTransfer.getData('text/uri-list');
        files = dataTransfer.files;

        if (files && files.length > 0) {
            this.dictionary[ true === isIndexFile ? 'index' : 'data' ] = files[ 0 ];
        } else if (url && '' !== url) {
            this.dictionary[ true === isIndexFile ? 'index' : 'data' ] = url;
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

            _isIndexFile = isAnIndexFile.call(this, this.dictionary.data);
            if (true === _isIndexFile) {
                this.fileLoadWidget.presentErrorMessage('Error: index file submitted as data file.');
                return undefined;
            } else {

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

    return app;
}) (app || {});

