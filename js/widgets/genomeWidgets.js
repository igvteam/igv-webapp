/**
 * Helper functions and objects for the genome dropdown menu.  Exports a single function:
 *
 * -  createGenomeWidgets(igvMain, browser, genomes)
 */


import {ModalTable, GenericDataSource} from '../../node_modules/data-modal/src/index.js'
import {StringUtils} from "../../node_modules/igv-utils/src/index.js"

import Globals from "../globals.js"
import alertSingleton from "./alertSingleton.js"
import {createURLModalElement} from "./urlModal.js"
import URLLoadWidget from "./urlLoadWidget.js"
import * as Utils from './utils.js'
import {genarkDatasourceConfigurator} from "./genarkDatasourceConfigurator.js"
import GenomeFileLoad from "./genomeFileLoad.js"

const MAX_CUSTOM_GENOMES = 5

let predefinedGenomeIds
let predefinedGenomes
let genarkModalTable
let genomeWidgetModal
let predefinedGenomesMap = new Map()

async function createGenomeWidgets(igvMain, browser, genomes) {

    const urlModalId = 'igv-app-genome-from-url-modal'
    const genarkModalId = 'igv-app-genome-genark-modal'

    const genarkModalTableConfig =
        {
            id: genarkModalId,
            title: 'UCSC GenArk',
            selectionStyle: 'single',
            pageLength: 100,
            okHandler: result => {
                const {accession} = result[0]
                loadGenome({genarkAccession: accession})
            }
        }
    genarkModalTable = new ModalTable(genarkModalTableConfig)

    const dataSource = new GenericDataSource(genarkDatasourceConfigurator())
    genarkModalTable.setDatasource(dataSource)

    // URL modal
    const urlModalElement = createURLModalElement(urlModalId, 'Genome URL')
    igvMain.appendChild(urlModalElement)

    // File widget
    const fileLoadWidget = new URLLoadWidget({
        widgetParent: urlModalElement.querySelector('.modal-body'),
        dataTitle: 'Genome',
        indexTitle: 'Index',
        dataOnly: false
    })

    const genomeFileLoad = new GenomeFileLoad(
        {
            localFileInput: document.getElementById('igv-app-dropdown-local-genome-file-input'),
            dropboxButton: document.getElementById('igv-app-dropdown-dropbox-genome-file-button'),
            googleDriveButton: document.getElementById('igv-app-dropdown-google-drive-genome-file-button'),
            loadHandler: async configuration => {
                if (configuration.id !== browser.genome.id) {
                    await loadGenome(configuration)
                }
            }
        })

    // Configures both file widget and url modal, a bit confusing
    genomeWidgetModal = new bootstrap.Modal(urlModalElement)
    Utils.configureModal(fileLoadWidget, genomeWidgetModal, async fileLoadWidget => {

        try {
            await genomeFileLoad.loadPaths(fileLoadWidget.retrievePaths())
        } catch (e) {
            console.error(e)
            alertSingleton.present(e)
        }

    })

    initializeGenomeWidgets(genomes)
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
        predefinedGenomes = genomes.reverse() // Default genome list
        predefinedGenomeIds = new Set(predefinedGenomes.map(g => g.id))
        for(const genomeJson of genomes) {
            if (genomeJson.id) {
                predefinedGenomesMap.set(genomeJson.id, genomeJson)
            }
        }
        updateGenomeList()

    } catch (e) {
        alertSingleton.present(e.message)
    }
}

function getRecentGenomes() {
    const customGenomeString = localStorage.getItem("recentGenomes")
    return customGenomeString ? JSON.parse(customGenomeString).reverse() : []
}


function updateGenomeList() {

    const dropdownMenu = document.getElementById('igv-app-genome-dropdown-menu')

    // NOTE:  MUST USE ID HERE, THERE CAN BE MULTIPLE DIVIDERS.
    const divider = dropdownMenu.querySelector('#igv-app-genome-dropdown-divider')

    // discard all buttons following the divider div
    let sibling = divider.nextElementSibling
    while (sibling) {
        const nextSibling = sibling.nextElementSibling
        sibling.remove()
        sibling = nextSibling
    }

    const addEntryFor = (genomeJson) => {
        const key = genomeJson.id
        let value = genomeJson

        const button = document.createElement('button')
        button.className = 'dropdown-item'
        button.type = 'button'
        button.textContent = value.name

        divider.insertAdjacentElement('afterend', button)

        button.dataset.id = key
        button.addEventListener('click', async () => {
            const id = button.dataset.id
            if (id !== Globals.browser.genome.id) {
                if(predefinedGenomesMap.has(id)) {
                    value = predefinedGenomesMap.get(id)
                }
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

    const recentGenomes = getRecentGenomes()
    if (recentGenomes && recentGenomes.length > 0) {
        const divider2 = document.createElement('div')
        divider2.className = 'dropdown-divider'
        divider.insertAdjacentElement('afterend', divider2)
        for (let genomeJson of recentGenomes) {
            addEntryFor(genomeJson)
        }
    }
}


async function loadGenome(genomeConfiguration) {

    let g = undefined
    try {
        g = await Globals.browser.loadGenome(genomeConfiguration)
        if (g.id) {
            try {

                // Last loaded genome ID, reloaded automatically on next page load
                localStorage.setItem("genomeID", g.id)

                // Update the recent genomes list
                if (StringUtils.isString(genomeConfiguration)) {
                    genomeConfiguration = {id: genomeConfiguration}
                } else {
                    if (!genomeConfiguration.id) genomeConfiguration.id = g.id
                }
                if (!genomeConfiguration.name) {
                    genomeConfiguration.name = g.name
                }


                const recentGenomeList = localStorage.getItem("recentGenomes")
                let recentGenomes = recentGenomeList ? JSON.parse(recentGenomeList) : []
                recentGenomes = recentGenomes.filter(r => r.id !== g.id)  // If already present, replace
                recentGenomes.unshift(genomeConfiguration)
                if (recentGenomes.length > MAX_CUSTOM_GENOMES) {
                    recentGenomes = recentGenomes.slice(0, MAX_CUSTOM_GENOMES)
                }
                localStorage.setItem("recentGenomes", JSON.stringify(recentGenomes))
                updateGenomeList()


            } catch (e) {
                console.error(e)
            }
        }

    } catch (e) {
        console.error(e)
        alertSingleton.present(e)
    }

}

export {createGenomeWidgets}

