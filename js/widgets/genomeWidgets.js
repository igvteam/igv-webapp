
import {ModalTable, GenericDataSource} from '../../node_modules/data-modal/src/index.js'
import {StringUtils} from "../../node_modules/igv-utils/src/index.js"

import Globals from "../globals.js"
import AlertSingleton from "./alertSingleton.js"
import {createURLModal} from "./urlModal.js"
import FileLoadManager from "./fileLoadManager.js"
import FileLoadWidget from "./fileLoadWidget.js"
import * as Utils from './utils.js'
import {genarkDatasourceConfigurator} from "./genarkDatasourceConfigurator.js"

const MAX_CUSTOM_GENOMES = 10

let predefinedGenomeIds
let predefinedGenomes
let genarkModalTable

function createGenomeWidgets({$igvMain, urlModalId, genarkModalId, genomeFileLoad}) {

    const genarkModalTableConfig =
        {
            id: genarkModalId,
            title: 'Genark',
            selectionStyle: 'single',
            pageLength: 100,
            okHandler: result => {
                const {accession} = result[0]
                loadGenome(accession)
            }
        }

    genarkModalTable = new ModalTable(genarkModalTableConfig)

    const dataSource = new GenericDataSource(genarkDatasourceConfigurator())
    genarkModalTable.setDatasource(dataSource)

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
 * @param genomes
 * @returns {Promise<void>}
 */
async function initializeGenomeWidgets(genomes) {
    try {
        predefinedGenomes = (await getAppLaunchGenomes(genomes)).reverse() // Default genome list
        predefinedGenomeIds = new Set(predefinedGenomes.map(g => g.id))
        updateGenomeList()

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

function getCustomGenomes() {
    const customGenomeString = localStorage.getItem("customGenomes")
    return customGenomeString ? JSON.parse(customGenomeString).reverse() : []
}


function updateGenomeList() {

    const $dropdown_menu = $('#igv-app-genome-dropdown-menu')

    // NOTE:  MUST USE ID HERE, THERE CAN BE MULTIPLE DIVIDERS.  JQUERY DOES WEIRD THINGS IN THE CODE THAT FOLLOWS IF $divider IS A COLLECTION
    const $divider = $dropdown_menu.find('#igv-app-genome-dropdown-divider')

    // discard all buttons following the divider div
    $divider.nextAll().off()
    $divider.nextAll().remove()

    const addEntryFor = (genomeJson) => {
        const key = genomeJson.id
        const value = genomeJson

        const $button = createButton(value.name)
        $button.insertAfter($divider)

        $button.data('id', key)

        const str = `click.genome-dropdown.${key}`

        $button.on(str, async () => {
            const id = $button.data('id')
            if (id !== Globals.browser.genome.id) {
                await loadGenome(value)
            }
        })
    }

    // TODO -- why do we need to add everthing in reverse?

    if (predefinedGenomes && predefinedGenomes.length > 0) {
        for (let genomeJson of predefinedGenomes) {
            addEntryFor(genomeJson)
        }
    }

    const customGenomes = getCustomGenomes()
    if (customGenomes && customGenomes.length > 0) {
        $('<div class="dropdown-divider"></div>').insertAfter($divider)
        for (let genomeJson of customGenomes) {
            addEntryFor(genomeJson)
        }

    }

}

function createButton(title) {

    let $button = $('<button>', {class: 'dropdown-item', type: 'button'})
    $button.text(title)

    return $button
}

async function loadGenome(genomeConfiguration, custom = false) {

    let g = undefined
    try {
        Globals.browser.startSpinner()
        g = await Globals.browser.loadGenome(genomeConfiguration)
        if (g.id) {
            try {

                // Last loaded genome ID, reloaded automatically on next page load
                localStorage.setItem("genomeID", g.id)

                // Update the custom list
                // hub.txt genomes are indirect, record name and id
                if (!predefinedGenomeIds.has(g.id)) {
                    if (StringUtils.isString(genomeConfiguration)) {
                        genomeConfiguration = {id: genomeConfiguration}
                    } else {
                        if (!genomeConfiguration.id) genomeConfiguration.id = g.id
                    }
                    if (!genomeConfiguration.name) {
                        genomeConfiguration.name = g.name
                    }


                    const customGenomesString = localStorage.getItem("customGenomes")
                    let customGenomes = customGenomesString ? JSON.parse(customGenomesString) : []
                    customGenomes = customGenomes.filter(r => r.id !== g.id)  // If already present, replace
                    customGenomes.unshift(genomeConfiguration)
                    if (customGenomes.length > MAX_CUSTOM_GENOMES) {
                        customGenomes = customGenomes.slice(0, MAX_CUSTOM_GENOMES)
                    }
                    localStorage.setItem("customGenomes", JSON.stringify(customGenomes))
                    updateGenomeList()
                }

            } catch (e) {
                console.error(e)
            }
        }

    } catch (e) {
        console.error(e)
        AlertSingleton.present(e)
    } finally {
        Globals.browser.stopSpinner()
    }

    // if (g) {
    //     EventBus.globalBus.post({type: "DidChangeGenome", data: g.id});
    // }
}

export {createGenomeWidgets, loadGenome, initializeGenomeWidgets}

