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

import { getExtension } from "./utils.js";

class FileLoadManager {
    
    constructor ({ isSessionFile }) {

        this.dictionary = {};

        if (undefined === isSessionFile) {
            this.isSessionFile = false;
        } else {
            this.isSessionFile = isSessionFile;
        }

        this.keyToIndexExtension =
            {
                bam: { extension: 'bai', optional: false },
                any: { extension: 'idx', optional: true  },
                gz: { extension: 'tbi', optional: true  }
            };

        this.indexExtensionToKey = {
            bai: 'bam',
            idx: 'any',
            tbi: 'gz'
        }

    }
    
    okHandler () {

        this.ingestPaths();

        let obj = this.trackLoadConfiguration();

        if (obj) {

            let self = this;

            FileLoadManager.extractName(obj)
                .then(function (name) {

                    if (true === self.isJSONExtension( getExtension(name) )) {

                        igv.xhr
                            .loadJson(obj.url)
                            .then(function (json) {
                                json.filename = json.name = name;
                                igv.browser.loadTrackList([json]);
                            });

                    } else {
                        obj.filename = obj.name = name;
                        igv.browser.loadTrackList( [ obj ] );
                    }

                    self.fileLoadWidget.dismissErrorMessage();
                })
                .catch(function (error) {
                    console.error(error);
                    igv.browser.loadTrackList( [ obj ] );
                });

            return true;
        } else {

            return false;
        }

    }

    inputHandler (path, isIndexFile) {
        this.ingestPath(path, isIndexFile);
    }

    ingestPaths() {
        
        this.ingestPath(this.fileLoadWidget.$inputData.val(), false);

        if (this.fileLoadWidget.$inputIndex) {
            this.ingestPath(this.fileLoadWidget.$inputIndex.val(), true);
        }

    }

    ingestPath (path, isIndexFile) {
        let key = true === isIndexFile ? 'index' : 'data';
        this.dictionary[ key ] = path;
    }

    trackLoadConfiguration () {
        var extension,
            key,
            config,
            _isIndexFile,
            _isIndexable,
            indexFileStatus;

        if ("" === this.dictionary.data) {
            this.dictionary.data = undefined;
        }

        // hack for Dropbox URLs with ?dl crap appended.
        this.dictionary.data = this.dictionary.data.split('?').shift();

        if ("" === this.dictionary.index) {
            this.dictionary.index = undefined;
        }

        if (undefined === this.dictionary.data) {
            this.fileLoadWidget.presentErrorMessage('Error: No data file');
            return undefined;
        } else {

            if (true === this.isJSONExtension( igv.getExtension({ url: this.dictionary.data }) )) {
                return { url: this.dictionary.data, indexURL: undefined }
            }

            if (this.dictionary.index) {
                _isIndexFile = this.isAnIndexFile(this.dictionary.index);
                if (false === _isIndexFile) {
                    this.fileLoadWidget.presentErrorMessage('Error: index file is not valid.');
                    return undefined;
                }
            }

            _isIndexable = this.isIndexable(this.dictionary.data);

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

    didDragDrop (dataTransfer) {
        var files;

        files = dataTransfer.files;

        return (files && files.length > 0);
    }
    
    dragDropHandler (dataTransfer, isIndexFile) {
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

    }

    isJSONExtension (extension) {
        return 'json' === extension || (this.googlePickerFilename && ('json' === igv.getExtension({ url: this.googlePickerFilename })))
    }
    indexName () {
        return itemName(this.dictionary.index);
    }

    dataName () {
        return itemName(this.dictionary.data);
    }

    reset () {
        this.dictionary = {};
    }

    isAnIndexFile(fileOrURL) {
        let extension;

        extension = igv.getExtension({ url: fileOrURL });
        return this.indexExtensionToKey.hasOwnProperty(extension);

    }

    isIndexable(fileOrURL) {

        let extension;

        if (true === this.isAnIndexFile(fileOrURL)) {
            return false;
        } else {
            extension = igv.getExtension({ url: fileOrURL });
            return (extension !== 'wig' && extension !== 'seg');
        }

    }

    static extractName(config) {

        if (undefined === config.name && igv.isString(config.url) && config.url.includes("drive.google.com")) {

            return igv.google
                .getDriveFileInfo(config.url)
                .then(json => json.originalFilename || json.name)

        } else {
            return Promise.resolve(undefined === config.name ? extractFilename(config.url) : config.name);
        }

        function extractFilename (urlOrFile) {
            if (igv.isFilePath(urlOrFile)) {
                return urlOrFile.name;
            } else {
                const str = urlOrFile.split('?').shift();
                const idx = urlOrFile.lastIndexOf("/");
                return idx > 0 ? str.substring(idx + 1) : str;
            }
        }

    }

}

function itemName (item) {
    return igv.isFilePath(item) ? item.name : item;
}

export default FileLoadManager;

