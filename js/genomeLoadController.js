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

import igv from './igv.esm.js';
import { loadGenome, isJSON, configureModal } from './utils.js';
import FileLoadWidget from './fileLoadWidget.js';
import FileLoadManager from './fileLoadManager.js';

class GenomeLoadController {

    constructor (browser, { $urlModal, genomes }) {

        let self = this,
            urlConfig,
            doOK;

        this.genomes = genomes;

        // URL
        urlConfig =
            {
                dataTitle: 'Genome',
                $widgetParent: $urlModal.find('.modal-body'),
                mode: 'url'
            };

        this.urlWidget = new FileLoadWidget(urlConfig, new FileLoadManager());

        doOK = function (fileLoadManager) {
            okHandler(self, fileLoadManager);
        };

        configureModal(this.urlWidget, $urlModal, doOK);

    }

    getAppLaunchGenomes () {

        let path;

        if(!this.genomes) {
            return Promise.resolve(undefined);
        }
        if(Array.isArray(this.genomes)) {
            return Promise.resolve(buildDictionary(this.genomes));
        }

        else {
            path = this.genomes;

            return igv.xhr

                .loadJson(path, {})

                .then(function (result) {

                    return buildDictionary(result);
                });
        }

        function buildDictionary(array) {

            let dictionary;
            dictionary = {};
            if (true === Array.isArray(array)) {
                array.forEach(function (json) {
                    dictionary[ json.id ] = json;
                });
            } else {
                dictionary[ array.id ] = array;
            }

            return dictionary;
        }

    }

    genomeConfiguration (fileLoadManager) {

        let self = this,
            obj;

        if (true === isJSON(fileLoadManager.dictionary.data)) {
            obj = {};
            obj[ 'noname' ] = fileLoadManager.dictionary.data;

            return Promise.resolve(obj);

        } else {

            obj = {};
            obj[ 'noname' ] =
                {
                    fastaURL: fileLoadManager.dictionary.data,
                    indexURL: fileLoadManager.dictionary.index
                };

            return Promise.resolve(obj);
        }

    }

}

export function genomeDropdownLayout({ browser, genomeDictionary, $dropdown_menu}) {

    var $divider,
        $button;

    // discard all buttons preceeding the divider div
    $divider = $dropdown_menu.find('#igv-app-genome-dropdown-divider');
    $divider.prevAll().remove();

    for (let key in genomeDictionary) {

        if (genomeDictionary.hasOwnProperty(key)) {

            $button = createButton(key);

            // prepend buttons relative to divider
            $button.insertBefore( $divider );

            $button.on('click', function () {
                var key;

                key = $(this).text();

                if (key !== browser.genome.id) {
                    loadGenome(genomeDictionary[ key ]);
                }

            });

        } // if (...)

    } // for (...)

    function createButton (title) {
        var $button;

        $button = $('<button>', { class:'dropdown-item', type:'button' });
        $button.text(title);

        return $button;
    }

}

function okHandler(genomeLoadController, fileLoadManager) {

    if (isValidGenomeConfiguration(fileLoadManager)) {

        genomeLoadController
            .genomeConfiguration(fileLoadManager)
            .then(function (obj) {
                let genome;
                genome = Object.values(obj).pop();
                loadGenome(genome);
            });

    }

}

function isValidGenomeConfiguration(fileLoadManager) {

    let success = true;

    if (undefined === fileLoadManager.dictionary) {

        success = false;
    } else if (undefined === fileLoadManager.dictionary.data) {

        success = false;
    } else if (undefined === fileLoadManager.dictionary.data && undefined === fileLoadManager.dictionary.index) {

        success = false;
    }

    return success;

}

export default GenomeLoadController;

