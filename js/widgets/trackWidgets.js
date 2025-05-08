/**
 * Helper functions and objects for supporting the "Tracks" menu.  Exports 2 functions:
 *
 * - createTrackWidgets(igvMain, browser, config) - creates the widgets and adds them to the igvMain element
 * - trackMenuGenomeChange(browser, genome) - updates the track menu from genome change events
 */


import {ModalTable, GenericDataSource} from '../../node_modules/data-modal/src/index.js'
import {igvxhr} from '../../node_modules/igv-utils/src/index.js'
import {encodeTrackDatasourceConfigurator, supportsGenome} from './encodeTrackDatasourceConfigurator.js'
import alertSingleton from './alertSingleton.js'
import {createTrackURLModalElement} from './trackURLModal.js'
import URLLoadWidget from "./urlLoadWidget.js"
import MultipleTrackLoadHelper from "./multipleTrackLoadHelper.js"
import createTrackSelectionModal from './trackSelectionModal.js'
import * as Utils from './utils.js'
import {GooglePicker} from "../../node_modules/igv-utils/src/index.js"
import {initializeDropbox} from "./dropbox.js"
import igv from '../../node_modules/igv/dist/igv.esm.min.js'

const id_prefix = 'genome_specific_'

let encodeModalTables = []
let customModalTables = []
let trackLoadHandler

const encodeTrackModalIds = ['igv-app-encode-signals-chip-modal', 'igv-app-encode-signals-other-modal', 'igv-app-encode-others-modal']

let trackRegistry

async function createTrackWidgets(igvMain, browser, config) {

    if (!trackRegistry && config.trackRegistryFile) {
        try {
            trackRegistry = await igvxhr.loadJson(config.trackRegistryFile)
        } catch (e) {
            alertSingleton.present(`Error retrieving track registry file: ${config.trackRegistryFile}`)
        }
    }

    trackLoadHandler = async configurations => {
        try {
            await browser.loadTrackList(configurations)
        } catch (e) {
            console.error(e)
            alertSingleton.present(e)
        }
    }
    const trackLoadHelper = new MultipleTrackLoadHelper(trackLoadHandler)

    // Local files
    const localFileInput = document.getElementById('igv-app-dropdown-local-track-file-input')
    localFileInput.addEventListener('change', async () => {
        if (localFileInput.files && localFileInput.files.length > 0) {
            const {files} = localFileInput
            const paths = Array.from(files)
            localFileInput.value = ''
            await trackLoadHelper.loadPaths(paths)
        }
    })

    // Load from URL
    const urlModalId = 'igv-app-track-from-url-modal'
    const urlModalElement = createTrackURLModalElement(urlModalId)
    igvMain.appendChild(urlModalElement)

    const urlLoadModal = new bootstrap.Modal(urlModalElement)

    const urlLoadWidget = new URLLoadWidget({
        widgetParent: urlModalElement.querySelector('.modal-body'),
        dataTitle: 'Track',
        indexTitle: 'Index',
        dataOnly: false
    })

    Utils.configureModal(urlLoadWidget, urlLoadModal, async urlLoadWidget => {
        const paths = urlLoadWidget.retrievePaths()
        await trackLoadHelper.loadPaths(paths)
        return true
    })


    // Dropbox
    const dropboxButton = document.getElementById('igv-app-dropdown-dropbox-track-file-button')
    if (dropboxButton) {
        dropboxButton.addEventListener('click', async () => {

            const result = await initializeDropbox()

            if (true === result) {
                const obj =
                    {
                        success: dbFiles => trackLoadHelper.loadPaths(dbFiles.map(({link}) => link)),
                        cancel: () => {
                        },
                        linkType: "preview",
                        multiselect: true,
                        folderselect: false,
                    }

                Dropbox.choose(obj)

            } else {
                alertSingleton.present('Cannot connect to Dropbox')
            }
        })
    }

    // Google Drive
    const googleDriveButton = document.getElementById('igv-app-dropdown-google-drive-track-file-button')
    if (googleDriveButton) {
        googleDriveButton.addEventListener('click', () => {
            GooglePicker.createDropdownButtonPicker(true,
                async responses => await trackLoadHelper.loadPaths(responses.map(({name, url}) => url)))
        })
    }


    // Prepare ENCODE modal tables -- these are resued for all genomes that support ENCODE
    for (let modalID of encodeTrackModalIds) {
        const encodeModalTableConfig =
            {
                id: modalID,
                title: 'ENCODE',
                selectionStyle: 'multi',
                pageLength: 100,
                okHandler: trackLoadHandler
            }
        encodeModalTables.push(new ModalTable(encodeModalTableConfig))
    }

}

async function trackMenuGenomeChange(browser, genome) {
    console.log("trackMenuGenomeChange", genome.id)
    // Remove existing items
    const $dropdownMenu = $('#igv-app-track-dropdown-menu')
    discardTrackMenuItems($dropdownMenu)
    customModalTables.forEach(modalTable => modalTable.remove())
    customModalTables = []

    const genomeID = genome.id

    const $divider = $dropdownMenu.find('.dropdown-divider')

    if (true === supportsGenome(genomeID)) {
        addEncodeButtons(genomeID, $divider)
    }

    const trackMenuConfigurations = trackRegistry ? await getTrackMenuConfigurationsFromRegistry(genome.id) : []
    const hubURLs = genome.getHubURLs()

    if (trackMenuConfigurations || hubURLs) {

        // Process hubs one at a time to prevent  a single failure from blocking others
        const configs = []
        if (hubURLs) {
            for (const url of hubURLs) {
                try {
                    const config = await prepHubConfig(url, genomeID)
                    configs.push(config)
                } catch (e) {
                    console.error(e)
                }
            }
        }

        if (trackMenuConfigurations) configs.push(...trackMenuConfigurations.map(c => prepRegistryConfig(c)))

        for (let config of configs.reverse()) {

            if (config.customModalTable) {

                // Custom data table modal
                createDropdownButton($divider, config.label, id_prefix)
                    .on('click', () => config.customModalTable.modal.show())

            } else {

                // Track selection modal
                createDropdownButton($divider, config.label, id_prefix)

                    .on('click', () => {
                        const loadedURLs = browser ? new Set(browser.findTracks(t => t.url).map(t => t.url)) : new Set()

                        const annotateTracks = (section) => {
                            for (const track of section.tracks) {
                                track.checked = loadedURLs.has(track.url)
                                //track.disabled = loadedURLs.has(track.url)
                                track.config = track
                            }
                            if (section.children) for (const child of section.children) {
                                annotateTracks(child)
                            }
                        }
                        for (const group of config.sections) {
                            annotateTracks(group)
                        }

                        config.okHandler = (selections) => {

                            const checkedURLs = new Set(selections.map(s => s.url))
                            const toUnload = new Set(Array.from(loadedURLs).filter(url => !checkedURLs.has(url)))
                            const tracksToUnload = browser.findTracks(track => track.url && toUnload.has(track.url))
                            for(let t of tracksToUnload) {
                                browser.removeTrack(t)
                            }

                            const trackConfigs = selections.filter(config => !loadedURLs.has(config.url))
                            if (trackConfigs.length > 0) {
                                try {
                                    browser.loadTrackList(trackConfigs)



                                } catch (e) {
                                    console.error(e)
                                    alertSingleton.present(e)
                                }
                            }
                        }
                        config.cancelHandler = () => {
                            modal.hide()
                        }

                        const modal = createTrackSelectionModal(config)
                        modal.show()
                    })
            }
        }
    }
}

function prepRegistryConfig(registry) {

    if ('custom-data-modal' === registry.type) {
        const customModalTable = new ModalTable({
            id: `igv-custom-modal-${Math.random().toString(36).substring(2, 9)}`,
            title: registry.label,
            okHandler: trackLoadHandler,
            selectionStyle: 'multi',
            pageLength: 100,
            datasource: new GenericDataSource(registry),
            description: registry.description
        })
        customModalTables.push(customModalTable)
        registry.customModalTable = customModalTable
        return registry
    } else {
        return {
            id: `_${Math.random().toString(36).substring(2, 9)}`,
            label: registry.label,
            description: registry.description,
            sections: [{
                label: registry.label,
                tracks: registry.tracks
            }],
        }
    }
}


async function prepHubConfig(hubURL, genomeID) {
    const hub = await igv.loadHub(hubURL)
    let descriptionUrl = hub.getDescriptionUrl()
    const groups = await hub.getGroupedTrackConfigurations(genomeID)
    return {
        id: `_${Math.random().toString(36).substring(2, 9)}`,
        label: hub.getShortLabel(),
        description: descriptionUrl ? `<a target=_blank href="${descriptionUrl}">${descriptionUrl}</a>` : '',
        sections: groups
    }
}


function addEncodeButtons(genomeID, $divider) {

    encodeModalTables[0].setDatasource(new GenericDataSource(encodeTrackDatasourceConfigurator(genomeID, 'signals-chip')))
    encodeModalTables[1].setDatasource(new GenericDataSource(encodeTrackDatasourceConfigurator(genomeID, 'signals-other')))
    encodeModalTables[2].setDatasource(new GenericDataSource(encodeTrackDatasourceConfigurator(genomeID, 'other')))

    const description = "<a href=hhttps://www.encodeproject.org/ target=_blank>Encylopedia of Genomic Elements</a>"
    encodeModalTables[0].setDescription(description)
    encodeModalTables[1].setDescription(description)
    encodeModalTables[2].setDescription(description)

    createDropdownButton($divider, 'ENCODE Other', id_prefix)
        .on('click', () => encodeModalTables[2].modal.show())

    createDropdownButton($divider, 'ENCODE Signals - Other', id_prefix)
        .on('click', () => encodeModalTables[1].modal.show())

    createDropdownButton($divider, 'ENCODE Signals - ChIP', id_prefix)
        .on('click', () => encodeModalTables[0].modal.show())
}


/**
 * Called upon a genome change.
 *
 * @param genomeID
 * @param trackConfigurations
 * @param $dropdownMenu
 * @param trackLoadHandler
 * @returns {Promise<void>}
 */

function createDropdownButton($divider, buttonText, id_prefix) {
    const $button = $('<button>', {class: 'dropdown-item', type: 'button'})
    $button.text(`${buttonText} ...`)
    $button.attr('id', `${id_prefix}${buttonText.toLowerCase().split(' ').join('_')}`)
    $button.insertAfter($divider)
    return $button
}


async function getTrackMenuConfigurationsFromRegistry(genomeID) {

    if (trackRegistry) {
        const JSONFilePaths = trackRegistry[genomeID]
        if (JSONFilePaths) {
            try {
                return await Promise.all(JSONFilePaths.map(path => igvxhr.loadJson(path)))
            } catch (e) {
                alertSingleton.present(e.message)
            }
        }
    }
}

function discardTrackMenuItems($dropdownMenu) {

    $dropdownMenu.find('.dropdown-divider')
    const searchString = '[id^=' + id_prefix + ']'
    const $found = $dropdownMenu.find(searchString)
    $found.remove()

}

export {
    trackMenuGenomeChange,
    createTrackWidgets
}

