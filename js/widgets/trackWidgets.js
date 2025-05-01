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
let $genericSelectModal = undefined
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
                                             selectModalIdOrUndefined,
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

    if (selectModalIdOrUndefined) {
        createGenericSelectModalWidget($igvMain, selectModalIdOrUndefined, trackLoadHandler, trackMenuHandler)
    }

}

function createGenericSelectModalWidget($igvMain, selectModalIdOrUndefined, trackLoadHandler, trackMenuHandler) {

    $genericSelectModal = $(createGenericSelectModal(selectModalIdOrUndefined, `${selectModalIdOrUndefined}-select`))

    $igvMain.append($genericSelectModal)
    const $select = $genericSelectModal.find('select')

    const $dismiss = $genericSelectModal.find('.modal-footer button:nth-child(1)')
    $dismiss.on('click', () => $genericSelectModal.modal('hide'))

    const $ok = $genericSelectModal.find('.modal-footer button:nth-child(2)')

    const okHandler = () => {

        const configurations = []
        const $selectedOptions = $select.find('option:selected')
        $selectedOptions.each(function () {
            // console.log(`${ $(this).val() } was selected`)
            configurations.push($(this).data('track'))
            $(this).removeAttr('selected')
        })

        if (configurations.length > 0) {
            trackLoadHandler(configurations)
        }

        $genericSelectModal.modal('hide')

    }

    $ok.on('click', okHandler)

    $genericSelectModal.get(0).addEventListener('keypress', event => {
        if ('Enter' === event.key) {
            okHandler()
        }
    })

    $genericSelectModal.on('show.bs.modal', () => {

        const trackConfigList = []
        $genericSelectModal.find('select').find('option').each(function () {

            const trackConfiguration = $(this).data('track')
            trackConfigList.push({element: $(this).get(0), trackConfiguration})
        })

        trackMenuHandler(trackConfigList)

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

        } else if ($genericSelectModal) {

            createDropdownButton($divider, buttonConfiguration.label, id_prefix)
                .on('click', () => {
                    //configureSelectModal($genericSelectModal, buttonConfiguration)
                    //$genericSelectModal.modal('show')
                    const loadedURLS = Globals.browser ? new Set(Globals.browser.tracks.filter(t => t.url).map(t => t.url)) : new Set()
                    const modal = configureSelectModal(buttonConfiguration, trackLoadHandler, loadedURLS)
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


function configureSelectModal(buttonConfiguration, trackLoadHandler, loadedURLS) {

    const id = buttonConfiguration.id ? buttonConfiguration.id : '__trackselect__'
    const section = {
        title: buttonConfiguration.label,
        tracks: buttonConfiguration.tracks.map(track => ({
            label: track.name,
            checked: loadedURLS.has(track.url),
            disabled: loadedURLS.has(track.url),
            infoURL: track.infoURL,
            config: track
        }))
    }

    const okHandler = (selections) => {

        const trackConfigs = selections.map(s => s.config)
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

// function configureSelectModal($genericSelectModal, buttonConfiguration) {
//     $genericSelectModal.find('.modal-title').text(`${buttonConfiguration.label}`)
//
//     let $select = $genericSelectModal.find('select')
//     $select.empty()
//
//     buttonConfiguration.tracks.reduce(($accumulator, configuration) => {
//
//         const $option = $('<option>', {value: configuration.name, text: configuration.name})
//         $select.append($option)
//
//         $option.data('track', configuration)
//
//         $accumulator.append($option)
//
//         return $accumulator
//     }, $select)
//
//     if (buttonConfiguration.description) {
//         $genericSelectModal.find('#igv-widgets-generic-select-modal-footnotes').html(buttonConfiguration.description)
//     }
// }

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
