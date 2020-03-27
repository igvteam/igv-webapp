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

import igv from '../node_modules/igv/dist/igv.esm.js';
import { trackLoadController, alertPanel } from './main.js';
import Globals from "./globals.js"

let validIndexExtensionSet = new Set(['fai', 'bai', 'crai', 'tbi', 'idx']);

let isValidIndexExtension = (path) => {
    return validIndexExtensionSet.has(getExtension(path));
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


    if ('bam' === extension || 'cram' === extension) {
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
    const a = igv.knownFileExtensions.has(extension);
    const b = igv.knownGenomeFileExtensions.has(extension);
    return a || b;
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

    (async (genome) => {

        let g = undefined;
        try {
            g = await Globals.browser.loadGenome(genome);
        } catch (e) {
            alertPanel.presentAlert(e.message);
        }

        if (g) {
            trackLoadController.updateTrackMenus(g.id);
        } else {
            const e = new Error(`Unable to load genome ${ genome.name }`);
            alertPanel.presentAlert(e.message);
            throw e;
        }

    })(genome);

};

let indexLookup = (dataSuffix) => {

    const fna =
        {
            index: 'fai',
            isOptional: false
        };

    const fa =
        {
            index: 'fai',
            isOptional: false
        };

    const fasta =
        {
            index: 'fai',
            isOptional: false
        };

    const bam =
        {
            index: 'bai',
            isOptional: false
        };

    const cram =
        {
            index: 'crai',
            isOptional: false
        };

    const gz =
        {
            index: 'tbi',
            isOptional: true
        };

    const bgz =
        {
            index: 'tbi',
            isOptional: true
        };

    const any =
        {
            index: 'idx',
            isOptional: true
        };

    const lut =
        {
            fna,
            fa,
            fasta,
            bam,
            cram,
            gz,
            bgz
        };

    if (lut[dataSuffix]) {
        return lut[dataSuffix];
    } else {
        return any;
    }

};

export { validIndexExtensionSet, isValidIndexExtension, getIndexObjectWithDataName, isKnownFileExtension, getFilename, getExtension, configureModal, loadGenome };
