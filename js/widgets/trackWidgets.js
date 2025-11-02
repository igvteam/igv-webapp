/**
 * Helper functions and objects for supporting the "Tracks" menu.  Exports 2 functions:
 *
 * - createTrackWidgets(igvMain, browser, config) - creates the widgets and adds them to the igvMain element
 * - trackMenuGenomeChange(browser, genome) - updates the track menu from genome change events
 */


import {GenericDataSource, ModalTable} from '../../node_modules/data-modal/src/index.js'
import {igvxhr, URIUtils} from '../../node_modules/igv-utils/src/index.js'
import * as GooglePicker from './googleFilePicker.js'
import {encodeTrackDatasourceConfigurator, supportsENCODE} from './encodeTrackDatasourceConfigurator.js'
import alertSingleton from './alertSingleton.js'
import {createTrackURLModalElement} from './trackURLModal.js'
import URLLoadWidget from "./urlLoadWidget.js"
import MultipleTrackLoadHelper from "./multipleTrackLoadHelper.js"
import createTrackSelectionModal from './trackSelectionModal.js'
import * as Utils from './utils.js'
import {initializeDropbox} from "./dropbox.js"
import igv from '../../node_modules/igv/dist/igv.esm.js'

const id_prefix = 'genome_specific_'

let encodeModalTables = []
let customModalTables = []
let trackLoadHandler

const encodeTrackModalIds = [
    'igv-app-encode-signals-chip-modal',
    'igv-app-encode-signals-other-modal',
    'igv-app-encode-others-modal',
    'igv-app-encode-hic-modal']

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
            const trackConfigs = configurations.filter(c => c.format !== 'sampleinfo')
            const sampleInfoConfigs = configurations.filter(c => c.format === 'sampleinfo')
            await Promise.all([
                browser.loadTrackList(trackConfigs),
                ...sampleInfoConfigs.map(config => browser.loadSampleInfo(config))
            ])
        } catch (e) {
            console.error(e)
            alertSingleton.present(e)
        }
    }
    const trackLoadHelper = new MultipleTrackLoadHelper(trackLoadHandler)

    // Local files
    const localFileInput = document.getElementById('igv-app-dropdown-local-track-file-input')
    if (localFileInput) {
        localFileInput.addEventListener('change', async () => {
            if (localFileInput.files && localFileInput.files.length > 0) {
                const {files} = localFileInput
                await trackLoadHelper.loadTrackFiles(Array.from(files).map(f => ({path: f, name: f.name})))
                localFileInput.value = ''
            }
        })
    }

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
        const urls = urlLoadWidget.retrievePaths()
        await trackLoadHelper.loadTrackFiles(urls.map(url => {
            const name = URIUtils.parseUri(url).file
            return {path: url, name: name}
        }))
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
                        success: dbFiles => {
                            return trackLoadHelper.loadTrackFiles(dbFiles.map(({link, name}) => ({
                                path: link,
                                name: name
                            })))
                        },
                        cancel: () => {
                        },
                        linkType: "direct",
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
                async responses => {
                    await trackLoadHelper.loadTrackFiles(responses.map(response => {
                        const {id, name} = response
                        return {
                            path: `https://www.googleapis.com/drive/v3/files/${id}?alt=media&supportsAllDrives=true`,
                            name
                        }
                    }))
                })
        })
    }


    // Prepare ENCODE modal tables -- these are resued for all genomes that support ENCODE
    if (encodeModalTables.length === 0) {
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
}


async function trackMenuGenomeChange(browser, genome) {

    const genomeID = genome.id

    // Remove existing genome specific items
    const $dropdownMenu = $('#igv-app-track-dropdown-menu')
    const $divider = $dropdownMenu.find('#igv-app-annotations-section')
    $divider.nextAll().remove()

    customModalTables.forEach(modalTable => modalTable.remove())
    customModalTables = []

    if (true === supportsENCODE(genomeID)) {
        addEncodeButtons(genomeID, $divider)
    }

    const trackMenuConfigurations = trackRegistry ? await getTrackMenuConfigurationsFromRegistry(genome.id) : []

    const genomeHubURLs = genome.getHubURLs() || []
    const configs = []

    // Process hubs one at a time to prevent  a single failure from blocking others
    if (genomeHubURLs) {
        for (const url of genomeHubURLs) {
            try {
                configs.push(await prepHubConfig(url, genomeID))
            } catch (e) {
                console.error(`Error loading hub configuration from URL: ${url}`, e)
            }
        }
    }

    if (trackMenuConfigurations) {
        configs.push(...trackMenuConfigurations)
    }


    for (let config of configs.reverse()) {

        if ('---' === config) {
            // Add a separator
            const divider = document.createElement('div')
            divider.className = 'dropdown-divider'
            $divider[0].parentNode.insertBefore(divider, $divider[0].nextSibling)

        } else if (config.customModalTable) {

            // Custom data table modal
            createDropdownButton($divider, config.label, id_prefix)
                .on('click', () => config.customModalTable.modal.show())

        } else {

            // Track selection modal
            createDropdownButton($divider, config.label, id_prefix)

                .on('click', () => {

                    // Collect url-name pairs for loaded tracks with urls.  This will serve as unique IDs to compare with track configs
                    const loadedIDs = browser ? new Set(browser.findTracks(t => t.url).map(t => `${t.url}-${t.name}`)) : new Set()

                    // Annotate track config objects with a unique ID comprised of url + name
                    const annotateTracks = (section) => {
                        if (section.tracks) {
                            for (const track of section.tracks) {
                                track._id = `${track.url}-${track.name}`
                                track._checked = loadedIDs.has(track._id)
                            }
                        }
                        if (section.children) for (const child of section.children) {
                            annotateTracks(child)
                        }
                    }
                    for (const group of config.sections) {
                        annotateTracks(group)
                    }

                    config.okHandler = async (checkedTracks, uncheckedTracks) => {
                        const uncheckedIDs = new Set(uncheckedTracks.map(s => s._id))
                        const toUnload = new Set(Array.from(loadedIDs).filter(id => uncheckedIDs.has(id)))
                        browser.findTracks(track => toUnload.has(`${track.url}-${track.name}`))
                            .forEach(track => browser.removeTrack(track))

                        const trackConfigs = checkedTracks.filter(c => !loadedIDs.has(`${c.url}-${c.name}`))
                        if (trackConfigs.length > 0) {
                            try {
                                await trackLoadHandler(trackConfigs)
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
        label: `${hub.getShortLabel()}`,
        description: descriptionUrl ? `<a target=_blank href="${descriptionUrl}">${hub.getLongLabel()}</a>` : '',
        sections: groups
    }
}


function addEncodeButtons(genomeID, $divider) {

    const hasHIC = genomeID.startsWith("hg") || genomeID.startsWith("mm")

    encodeModalTables[0].setDatasource(new GenericDataSource(encodeTrackDatasourceConfigurator(genomeID, 'signals-chip')))
    encodeModalTables[1].setDatasource(new GenericDataSource(encodeTrackDatasourceConfigurator(genomeID, 'signals-other')))
    encodeModalTables[2].setDatasource(new GenericDataSource(encodeTrackDatasourceConfigurator(genomeID, 'other')))

    const description = "<a href=https://www.encodeproject.org/ target=_blank>Encylopedia of Genomic Elements</a>"
    encodeModalTables[0].setDescription(description)
    encodeModalTables[1].setDescription(description)
    encodeModalTables[2].setDescription(description)

    if (hasHIC) {
        encodeModalTables[3].setDatasource(new GenericDataSource(encodeTrackDatasourceConfigurator(genomeID, 'hic')))
        encodeModalTables[3].setDescription(description)
        if (hasHIC) {
            createDropdownButton($divider, 'ENCODE HIC', id_prefix)
                .on('click', () => encodeModalTables[3].modal.show())
        }
    }

    createDropdownButton($divider, 'ENCODE Other', id_prefix)
        .on('click', () => encodeModalTables[2].modal.show())

    createDropdownButton($divider, 'ENCODE Signals - Other', id_prefix)
        .on('click', () => encodeModalTables[1].modal.show())

    createDropdownButton($divider, 'ENCODE Signals - ChIP', id_prefix)
        .on('click', () => encodeModalTables[0].modal.show())

}


/**
 * Create a dropdown button and insert it after the annotations divider.
 * @param {JQuery} $divider
 * @param {string} buttonText
 * @param {string} id_prefix
 * @returns {JQuery}
 */
function createDropdownButton($divider, buttonText, id_prefix) {
    const $button = $('<button>', {class: 'dropdown-item', type: 'button'})
    $button.text(`${buttonText} ...`)
    $button.attr('id', `${id_prefix}${buttonText.toLowerCase().split(' ').join('_')}`)
    $button.insertAfter($divider)
    return $button
}


async function getTrackMenuConfigurationsFromRegistry(genomeID) {

    const configs = []
    if (trackRegistry) {
        const paths = trackRegistry[genomeID]
        if (paths) {
            // Load track configurations, which can be either JSON files or hub URLs, one at a time to prevent a single failure from blocking others
            for (let path of paths) {
                try {
                    if (path === '---') {
                        configs.push('---')
                    } else if (path.endsWith('.json')) {
                        configs.push(prepRegistryConfig(await igvxhr.loadJson(path)))
                    } else {
                        configs.push(await prepHubConfig(path, genomeID))
                    }
                } catch (e) {
                    console.error(`Error loading track configuration from registry: ${path}`, e)
                }
            }
        }
    }

    // No registry or no paths
    return configs
}


export {
    trackMenuGenomeChange,
    createTrackWidgets
}

