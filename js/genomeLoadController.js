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

import { loadGenome, configureModal } from './utils.js';
import FileLoadWidget from './fileLoadWidget.js';
import FileLoadManager from './fileLoadManager.js';

class GenomeLoadController {

    constructor (browser, { $urlModal, genomes, uberFileLoader }) {

        this.genomes = genomes;

        // URL
        let urlConfig =
            {
                dataTitle: 'Genome',
                $widgetParent: $urlModal.find('.modal-body'),
                mode: 'url'
            };

        this.urlWidget = new FileLoadWidget(urlConfig, new FileLoadManager());

        let self = this;
        configureModal(this.urlWidget, $urlModal, (fileLoadManager) => {
            uberFileLoader.ingestPaths(fileLoadManager.getPaths());
            return true;
        });

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
            return fetch(this.genomes)
                .then(response => {
                    return buildDictionary(response.json());
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

}

export function genomeDropdownLayout({ browser, genomeDictionary, $dropdown_menu}) {

    var $divider,
        $button;

    // discard all buttons preceeding the divider div
    $divider = $dropdown_menu.find('#igv-app-genome-dropdown-divider');
    $divider.prevAll().remove();

    for (let key in genomeDictionary) {

        if (genomeDictionary.hasOwnProperty(key)) {

            $button = createButton(genomeDictionary[ key ].name);
            $button.insertBefore( $divider );
            $button.data('id', key);

            $button.on('click', function () {

                const id = $(this).data('id');
                if (id !== browser.genome.id) {
                    loadGenome(genomeDictionary[ id ]);
                }

            });

        } // if (...)

    } // for (...)

    function createButton (title) {

        let $button = $('<button>', { class:'dropdown-item', type:'button' });
        $button.text(title);

        return $button;
    }

}

export default GenomeLoadController;

