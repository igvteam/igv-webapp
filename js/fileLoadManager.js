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

class FileLoadManager {

    constructor () {
        this.dictionary = {};
    }

    inputHandler (path, isIndexFile) {
        this.ingestPath(path, isIndexFile);
    }

    ingestPath (path, isIndexFile) {
        let key = true === isIndexFile ? 'index' : 'data';

        this.dictionary[ key ] = path.trim();
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

    indexName () {
        return itemName(this.dictionary.index);
    }

    dataName () {
        return itemName(this.dictionary.data);
    }

    reset () {
        this.dictionary = {};
    }

}

function itemName (item) {
    return igv.isFilePath(item) ? item.name : item;
}

export default FileLoadManager;

