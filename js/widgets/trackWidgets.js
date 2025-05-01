import {ModalTable, GenericDataSource} from '../../node_modules/data-modal/src/index.js'
import {igvxhr} from '../../node_modules/igv-utils/src/index.js'
import {encodeTrackDatasourceConfigurator, supportsGenome} from './encodeTrackDatasourceConfigurator.js'
import alertSingleton from './alertSingleton.js'
import {createGenericSelectModal} from './genericSelectModal.js'
import {createTrackURLModalElement} from './trackURLModal.js'
import URLLoadWidget from "./urlLoadWidget.js"
import MultipleTrackFileLoad from "./multipleTrackFileLoad.js"
import createTrackSelectionModal from './trackSelectionModal.js'
import * as Utils from './utils.js'
import Globals from "../globals.js"

const id_prefix = 'genome_specific_'

let fileLoadWidget
let multipleTrackFileLoad
let encodeModalTables = []
let customModalTable
let trackWidgetModal
const defaultCustomModalTableConfig =
    {
        // id: modalID,
        // title: 'ENCODE',
        selectionStyle: 'multi',
        pageLength: 100
    }


function createTrackWidgetsWithTrackRegistry($igvMain,
                                             $dropdownMenu,
                                             $localFileInput,
                                             initializeDropbox,
                                             $dropboxButton,
                                             googleEnabled,
                                             $googleDriveButton,
                                             encodeTrackModalIds,
                                             urlModalId,
                                             GtexUtilsOrUndefined,
                                             trackRegistryFile,
                                             trackLoadHandler,
                                             trackMenuHandler) {

    const urlModalElement = createTrackURLModalElement(urlModalId)
    $igvMain.get(0).appendChild(urlModalElement)

    let fileLoadWidgetConfig =
        {
            widgetParent: urlModalElement.querySelector('.modal-body'),
            dataTitle: 'Track',
            indexTitle: 'Index',
            dataOnly: false
        }

    fileLoadWidget = new URLLoadWidget(fileLoadWidgetConfig)

    trackWidgetModal = new bootstrap.Modal(urlModalElement)
    Utils.configureModal(fileLoadWidget, trackWidgetModal, async fileLoadWidget => {
        const paths = fileLoadWidget.retrievePaths()
        await multipleTrackFileLoad.loadPaths(paths)
        return true
    })

    if ($googleDriveButton && !googleEnabled) {
        $googleDriveButton.parent().hide()
    }

    const multipleTrackFileLoadConfig =
        {
            $localFileInput,
            initializeDropbox,
            $dropboxButton,
            $googleDriveButton: googleEnabled ? $googleDriveButton : undefined,
            fileLoadHandler: trackLoadHandler,
            multipleFileSelection: true
        }

    multipleTrackFileLoad = new MultipleTrackFileLoad(multipleTrackFileLoadConfig)

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

    customModalTable = new ModalTable({
        id: 'igv-custom-modal',
        title: 'UNTITLED',
        okHandler: trackLoadHandler, ...defaultCustomModalTableConfig
    })
}

async function updateTrackMenusWithTrackConfigurations(genomeID, GtexUtilsOrUndefined, trackConfigurations, $dropdownMenu, trackLoadHandler) {

    discardTrackMenuItems($dropdownMenu)

    const $divider = $dropdownMenu.find('.dropdown-divider')

    let buttonConfigurations = []

    for (const trackConfiguration of trackConfigurations) {

        if (true === supportsGenome(genomeID) && 'ENCODE' === trackConfiguration.type) {
            encodeModalTables[0].setDatasource(new GenericDataSource(encodeTrackDatasourceConfigurator(genomeID, 'signals-chip')))
            encodeModalTables[1].setDatasource(new GenericDataSource(encodeTrackDatasourceConfigurator(genomeID, 'signals-other')))
            encodeModalTables[2].setDatasource(new GenericDataSource(encodeTrackDatasourceConfigurator(genomeID, 'other')))
        }
        trackConfiguration.igvxhr = igvxhr
        buttonConfigurations.push(trackConfiguration)

    } // for(jsons)

    for (let buttonConfiguration of buttonConfigurations.reverse()) {

        if (buttonConfiguration.type && 'custom-data-modal' === buttonConfiguration.type) {

            createDropdownButton($divider, buttonConfiguration.label, id_prefix)
                .on('click', () => {

                    if (buttonConfiguration.description) {
                        customModalTable.setDescription(buttonConfiguration.description)
                    }

                    customModalTable.setDatasource(new GenericDataSource(buttonConfiguration))
                    customModalTable.setTitle(buttonConfiguration.label)
                    customModalTable.modal.show()
                })

        } else if (buttonConfiguration.type && 'ENCODE' === buttonConfiguration.type) {

            if (true === supportsGenome(genomeID)) {

                if (buttonConfiguration.description) {
                    encodeModalTables[0].setDescription(buttonConfiguration.description)
                    encodeModalTables[1].setDescription(buttonConfiguration.description)
                    encodeModalTables[2].setDescription(buttonConfiguration.description)
                }

                createDropdownButton($divider, 'ENCODE Other', id_prefix)
                    .on('click', () => encodeModalTables[2].modal.show())

                createDropdownButton($divider, 'ENCODE Signals - Other', id_prefix)
                    .on('click', () => encodeModalTables[1].modal.show())

                createDropdownButton($divider, 'ENCODE Signals - ChIP', id_prefix)
                    .on('click', () => encodeModalTables[0].modal.show())

            }

        } else {
            createDropdownButton($divider, buttonConfiguration.label, id_prefix)

                .on('click', () => {
                    const loadedURLs = Globals.browser ? new Set(Globals.browser.tracks.filter(t => t.url).map(t => t.url)) : new Set()
                    const id = buttonConfiguration.id ? buttonConfiguration.id : `_${Math.random().toString(36).substring(2, 9)}`
                    const section = {
                        title: buttonConfiguration.label,
                        tracks: buttonConfiguration.tracks.map(track => ({
                            id: track.name,
                            label: track.name,
                            checked: loadedURLs.has(track.url),
                            disabled: loadedURLs.has(track.url),
                            infoURL: track.infoURL,
                            config: track
                        }))
                    }

                    const modal = createTrackSelectionModal({
                        id,
                        title: buttonConfiguration.label,
                        sections: [section],
                        headerHtml: buttonConfiguration.description,
                        okHandler: (selections) => {
                            const trackConfigs = selections.map(s => s.config).filter(config => !loadedURLs.has(config.url))
                            if (trackConfigs.length > 0) {
                                trackLoadHandler(trackConfigs)
                            }
                        },
                        cancelHandler: () => {
                            console.log('Cancel clicked')
                            modal.hide()
                        }
                    })
                    modal.show()
                })

        }
    } // for (buttonConfigurations)

}

function createDropdownButton($divider, buttonText, id_prefix) {
    const $button = $('<button>', {class: 'dropdown-item', type: 'button'})
    $button.text(`${buttonText} ...`)
    $button.attr('id', `${id_prefix}${buttonText.toLowerCase().split(' ').join('_')}`)
    $button.insertAfter($divider)
    return $button
}


function configureSelectModal(buttonConfiguration, trackLoadHandler, loadedURLs) {

    const id = buttonConfiguration.id ? buttonConfiguration.id : `__trackselect__${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const section = {
        title: buttonConfiguration.label,
        tracks: buttonConfiguration.tracks.map(track => ({
            id: track.name,
            label: track.name,
            checked: loadedURLs.has(track.url),
            disabled: loadedURLs.has(track.url),
            infoURL: track.infoURL,
            config: track
        }))
    }

    const okHandler = (selections) => {

        const trackConfigs = selections.map(s => s.config).filter(config => !loadedURLs.has(config.url))
        if (trackConfigs.length > 0) {
            trackLoadHandler(trackConfigs)
        }
    }

    const modal = createTrackSelectionModal({
        id,
        title: buttonConfiguration.label,
        sections: [section],
        headerHtml: buttonConfiguration.description,
        okHandler,
        cancelHandler: () => {
            console.log('Cancel clicked')
            modal.hide()
        }
    })

    return modal
}

async function getPathsWithTrackRegistryFile(genomeID, trackRegistryFile) {

    let response = undefined
    try {
        response = await fetch(trackRegistryFile)
    } catch (e) {
        console.error(e)
    }

    let trackRegistry = undefined
    if (response) {
        trackRegistry = await response.json()
    } else {
        const e = new Error("Error retrieving registry via getPathsWithTrackRegistryFile()")
        alertSingleton.present(e.message)
        throw e
    }

    // Paths to JSON files
    const JSONFilePaths = trackRegistry[genomeID]

    if (undefined === JSONFilePaths) {
        return undefined
    }

    let responses = []
    try {
        responses = await Promise.all(JSONFilePaths.map(path => fetch(path)))
    } catch (e) {
        alertSingleton.present(e.message)
    }

    /*

     */

    let trackConfigurations = []
    try {
        trackConfigurations = await Promise.all(responses.map(response => response.json()))
    } catch (e) {
        alertSingleton.present(e.message)
    }

    return trackConfigurations
}

function discardTrackMenuItems($dropdownMenu) {

    $dropdownMenu.find('.dropdown-divider')
    const searchString = '[id^=' + id_prefix + ']'
    const $found = $dropdownMenu.find(searchString)
    $found.remove()

}

export {
    discardTrackMenuItems,
    updateTrackMenusWithTrackConfigurations,
    createTrackWidgetsWithTrackRegistry,
    getPathsWithTrackRegistryFile
}
