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

import {
    AlertSingleton,
    createURLModal,
    FileLoadManager,
    FileLoadWidget,
    Utils
} from '../node_modules/igv-widgets/dist/igv-widgets.js'
import Globals from "./globals.js"

const MAX_CUSTOM_GENOMES = 5

let knownGenomeIds

function createGenomeWidgets({$igvMain, urlModalId, genomeFileLoad}) {

    // URL modal
    const $urlModal = $(createURLModal(urlModalId, 'Genome URL'))
    $igvMain.append($urlModal)


    // File widget
    const fileLoadWidget = new FileLoadWidget({
        widgetParent: $urlModal.find('.modal-body').get(0),
        dataTitle: 'Genome',
        indexTitle: 'Index',
        mode: 'url',
        fileLoadManager: new FileLoadManager(),
        dataOnly: false,
        doURL: true
    })

    // Configures both file widget and url modal, a bit confusing
    Utils.configureModal(fileLoadWidget, $urlModal.get(0), async fileLoadWidget => {

        try {
            await genomeFileLoad.loadPaths(fileLoadWidget.retrievePaths())
        } catch (e) {
            console.error(e)
            AlertSingleton.present(e)
        }

    })
}

/**
 * Initialize the genome selection widget with pre-defined and user-defined genomes.  Because of the way these
 * items are added in 'genomeDropdownLayout' they are added in reverse order.
 *
 * @param browser
 * @param genomes
 * @param $dropdown_menu
 * @returns {Promise<void>}
 */
async function initializeGenomeWidgets(browser, genomes, $dropdown_menu) {
    try {

        // Start with predefined genomes.  This can return undefined.
        knownGenomeIds = genomes ? new Set(genomes.map(g => g.id)) : new Set()
        let genomeList = await getAppLaunchGenomes(genomes)

        // Add user loaded genomes
        genomeList = addCustomGenomes(genomeList || [])

        if (genomeList.length > 0) {
            updateGenomeList({browser, genomeList, $dropdown_menu})
        }

    } catch (e) {
        AlertSingleton.present(e.message)
    }
}

async function getAppLaunchGenomes(genomes) {

    if (undefined === genomes) {
        return undefined
    }
    if (Array.isArray(genomes)) {
        return genomes
    } else {

        let response = undefined
        try {
            response = await fetch(genomes)
        } catch (e) {
            AlertSingleton.present(e.message)
        }

        if (response) {
            let json = await response.json()
            return json
        }
    }
}

function addCustomGenomes(genomeList) {
    const customGenomeString = localStorage.getItem("recentGenomes")
    if (customGenomeString) {
        const customGenomeJson = JSON.parse(customGenomeString)
        if (customGenomeJson.length > 0) {
            genomeList.push('-')
            for (let json of customGenomeJson.reverse()) {
                genomeList.push(json)
            }
        }
    }
    return genomeList
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

function updateGenomeList({browser, genomeList, $dropdown_menu}) {

    // discard all buttons preceeding the divider div
    // TODO -- does this use of find assume there is 1 dropdown-divider?  Searching by ID would be more robust.
    let $divider = $dropdown_menu.find('.dropdown-divider')
    $divider.nextAll().remove()

    for (let genomeJson of genomeList) {

        const key = genomeJson.id
        const value = genomeJson

        if ('-' === genomeJson) {
            $('<div class="dropdown-divider"></div>').insertAfter($divider)
        } else {
            const $button = createButton(value.name)
            $button.insertAfter($divider)

            $button.data('id', key)

            const str = `click.genome-dropdown.${key}`

            $button.on(str, async () => {

                const id = $button.data('id')

                if (id !== browser.genome.id) {
                    await loadGenome(value)
                }

            })
        }

    } // for (...)

    function createButton(title) {

        let $button = $('<button>', {class: 'dropdown-item', type: 'button'})
        $button.text(title)

        return $button
    }

}

async function loadGenome(genomeConfiguration, custom = false) {

    let g = undefined
    try {
        g = await Globals.browser.loadGenome(genomeConfiguration)
        if (g.id) {
            try {

                // Last loaded genome ID, reloaded automatically on next page load
                localStorage.setItem("genomeID", g.id)

                // Update the recently loaded list
                // hub.txt genomes are indirect, record name and id
                if (!genomeConfiguration.id) genomeConfiguration.id = g.id
                if (!genomeConfiguration.name) genomeConfiguration.name = g.name

                const recentGenomesString = localStorage.getItem("recentGenomes")
                let recentGenomes = recentGenomesString ? JSON.parse(recentGenomesString) : []
                recentGenomes = recentGenomes.filter(r => r.id !== g.id)  // If already present, replace
                recentGenomes.unshift(genomeConfiguration)
                if (recentGenomes.length > MAX_CUSTOM_GENOMES) {
                    recentGenomes = recentGenomes.slice(0, MAX_CUSTOM_GENOMES)
                }
                localStorage.setItem("recentGenomes", JSON.stringify(recentGenomes))


            } catch (e) {
                console.error(e)
            }
        }

    } catch (e) {
        console.error(e)
        AlertSingleton.present(e)
    }

    // if (g) {
    //     EventBus.globalBus.post({type: "DidChangeGenome", data: g.id});
    // }
}

export {createGenomeWidgets, loadGenome, initializeGenomeWidgets}

