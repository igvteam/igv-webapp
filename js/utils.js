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

import { trackLoadController } from './main.js';

let isValidIndexExtension = (path) => {
    let set;
    set = new Set(['fai', 'bai', 'tbi', 'idx']);
    return set.has(getExtension(path));
};

let getIndexObjectWithDataName = (name) => {
    let extension,
        dataSuffix,
        lookup,
        indexObject,
        aa;

    extension = getExtension(name);

    if (false === isKnownFileExtension(extension)) {
        return undefined;
    }

    dataSuffix = name.split('.').pop();

    lookup = indexLookup(dataSuffix);

    indexObject = {};

    // aa
    aa = name + '.' + lookup.index;

    indexObject[aa] = {};
    indexObject[aa].data = name;
    indexObject[aa].isOptional = lookup.isOptional;


    if ('bam' === extension) {
        let bb,
            parts;

        // bb
        parts = name.split('.');
        parts.pop();
        bb = parts.join('.') + '.' + lookup.index;

        indexObject[bb] = {};
        indexObject[bb].data = name;
        indexObject[bb].isOptional = lookup.isOptional;
    }

    return indexObject;
};

let isKnownFileExtension = (extension) => {
    let fasta,
        union;

    fasta = new Set(['fa', 'fasta']);
    union = new Set([...(igv.knownFileExtensions), ...fasta]);
    return union.has(extension);
};

let getFilename = (path) => {
    return path.google_url ? path.name : igv.getFilename(path);
};

let getExtension = (path) => {
    return igv.getExtension({url: path.google_url ? path.name : path});
};

let isJSON = (thang) => {
    // Better JSON test. JSON.parse gives false positives.
    return (true === (thang instanceof Object) && false === (thang instanceof File));
};

let configureModal = (fileLoadWidget, $modal, okHandler = undefined) => {
    let $dismiss,
        $ok;

    // upper dismiss - x - button
    $dismiss = $modal.find('.modal-header button:nth-child(1)');
    $dismiss.on('click', function () {
        fileLoadWidget.dismiss();
        $modal.modal('hide');
    });

    // lower dismiss - close - button
    $dismiss = $modal.find('.modal-footer button:nth-child(1)');
    $dismiss.on('click', function () {
        fileLoadWidget.dismiss();
        $modal.modal('hide');
    });

    // ok - button
    $ok = $modal.find('.modal-footer button:nth-child(2)');

    $ok.on('click', function () {

        let status = true;

        if (okHandler) {
            status = okHandler(fileLoadWidget.fileLoadManager);
        } else {
            status = fileLoadWidget.fileLoadManager.okHandler();
        }

        if (true === status) {
            fileLoadWidget.dismiss();
            $modal.modal('hide');
        }

    });

};

let loadGenome = (genome) => {

    igv.browser
        .loadGenome(genome)
        .then(function (genome) {
            trackLoadController.updateTrackMenus(genome.id);
        })
        .catch(function (error) {
            igv.browser.presentAlert(error);
        });

};

let indexLookup = (dataSuffix) => {
    let fa,
        fasta,
        bam,
        gz,
        any,
        lut;

    fa =
        {
            index: 'fai',
            isOptional: false
        };

    fasta =
        {
            index: 'fai',
            isOptional: false
        };

    bam =
        {
            index: 'bai',
            isOptional: false
        };

    gz =
        {
            index: 'tbi',
            isOptional: true
        };

    any =
        {
            index: 'idx',
            isOptional: true
        };

    lut =
        {
            fa: fa,
            fasta: fasta,
            bam: bam,
            gz: gz
        };

    if (lut[dataSuffix]) {
        return lut[dataSuffix];
    } else {
        return any;
    }

};

let isPromise = (obj) => { return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function'; };

export { isPromise, isValidIndexExtension, getIndexObjectWithDataName, isKnownFileExtension, getFilename, getExtension, isJSON, configureModal, loadGenome };