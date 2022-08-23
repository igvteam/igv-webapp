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

import {AlertSingleton, createURLModal,EventBus,FileLoadManager,FileLoadWidget,Utils} from '../node_modules/igv-widgets/dist/igv-widgets.js'
import Globals from "./globals.js";

let fileLoadWidget;

async function createGenomeWidgets({$igvMain, urlModalId, genomeFileLoad, browser, genomes, $dropdownMenu }) {

    const $urlModal = $(createURLModal(urlModalId, 'Genome URL'))
    $igvMain.append($urlModal);

    let config =
        {
            widgetParent: $urlModal.find('.modal-body').get(0),
            dataTitle: 'Genome',
            indexTitle: 'Index',
            mode: 'url',
            fileLoadManager: new FileLoadManager(),
            dataOnly: false,
            doURL: true
        };

    fileLoadWidget = new FileLoadWidget(config);

    Utils.configureModal(fileLoadWidget, $urlModal.get(0), async fileLoadWidget => {

        try {
            await genomeFileLoad.loadPaths( fileLoadWidget.retrievePaths() )
        } catch (e) {
            console.error(e);
            AlertSingleton.present(e)
        }

    })

    await initializeGenomeWidgets(browser, genomes, $dropdownMenu)

}

async function initializeGenomeWidgets(browser, genomes, $dropdown_menu) {
    try {

        const genomeMap = await getAppLaunchGenomes(genomes);

        if (genomeMap) {
            genomeDropdownLayout({ browser, genomeMap, $dropdown_menu });
        }

    } catch (e) {
        AlertSingleton.present(e.message)
    }

}

async function getAppLaunchGenomes(genomes) {

    if (undefined === genomes) {
        return undefined;
    }

    if (Array.isArray(genomes)) {
        return buildMap(genomes);
    } else {

        let response = undefined;
        try {
            response = await fetch(genomes);
        } catch (e) {
            AlertSingleton.present(e.message);
        }

        if (response) {
            let json = await response.json();
            return buildMap(json);
        }

    }
}

function buildMap(arrayOrJson) {

    const map = new Map()

    if (true === Array.isArray(arrayOrJson)) {

        for (let json of arrayOrJson.reverse()) {
            map.set(json.id, json)
        }

    } else {
        map.set(arrayOrJson.id, arrayOrJson)
    }

    return map
}

function genomeDropdownLayout({browser, genomeMap, $dropdown_menu}) {

    // discard all buttons preceeding the divider div
    let $divider = $dropdown_menu.find('.dropdown-divider');
    $divider.nextAll().remove();

    for (let [ key, value ] of genomeMap) {

        const $button = createButton(value.name);
        $button.insertAfter($divider);

        $button.data('id', key);

        const str = `click.genome-dropdown.${ key }`;

        $button.on(str, async () => {

            const id = $button.data('id');

            if (id !== browser.genome.id) {
                await loadGenome(value);
            }

        });

    } // for (...)

    function createButton(title) {

        let $button = $('<button>', {class: 'dropdown-item', type: 'button'});
        $button.text(title);

        return $button;
    }

}

async function loadGenome(genomeConfiguration) {

    let g = undefined;
    try {
        g = await Globals.browser.loadGenome(genomeConfiguration);
        if(g.id) {
            try {
                localStorage.setItem("genomeID", g.id)
            } catch (e) {
                console.error(e)
            }
        }

    } catch (e) {
        console.error(e);
        AlertSingleton.present(e)
    }

    if (g) {
        EventBus.globalBus.post({type: "DidChangeGenome", data: g.id});
    }
}

export {createGenomeWidgets, loadGenome}

