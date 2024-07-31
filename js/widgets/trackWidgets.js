import {ModalTable, GenericDataSource} from '../../node_modules/data-modal/src/index.js'
import {encodeTrackDatasourceConfigurator, supportsGenome} from './encodeTrackDatasourceConfigurator.js'
import AlertSingleton from './alertSingleton.js'
import {createGenericSelectModalElement} from './genericSelectModal.js'
import {createTrackURLModalElement} from './trackURLModal.js'
import FileLoadManager from "./fileLoadManager.js"
import FileLoadWidget from "./fileLoadWidget.js"
import MultipleTrackFileLoad from "./multipleTrackFileLoad.js"
import * as Utils from './utils.js'

let fileLoadWidget
let multipleTrackFileLoad
let encodeModalTables = []
let customModalTable
let genericSelectModal
let trackWidgetModal
const defaultCustomModalTableConfig =
    {
        // id: modalID,
        // title: 'ENCODE',
        selectionStyle: 'multi',
        pageLength: 100
    }

function createTrackWidgetsWithTrackRegistry(igvMain,
                                             dropdownMenu,
                                             localFileInput,
                                             initializeDropbox,
                                             dropboxButton,
                                             googleEnabled,
                                             googleDriveButton,
                                             encodeTrackModalIds,
                                             urlModalId,
                                             selectModalIdOrUndefined,
                                             GtexUtilsOrUndefined,
                                             trackRegistryFile,
                                             trackLoadHandler,
                                             trackMenuHandler) {

    const urlModalElement = createTrackURLModalElement(urlModalId)
    igvMain.appendChild(urlModalElement)

    let fileLoadWidgetConfig =
        {
            widgetParent: urlModalElement.querySelector('.modal-body'),
            dataTitle: 'Track',
            indexTitle: 'Index',
            mode: 'url',
            fileLoadManager: new FileLoadManager(),
            dataOnly: false,
            doURL: true
        }

    fileLoadWidget = new FileLoadWidget(fileLoadWidgetConfig)

    trackWidgetModal = new bootstrap.Modal(urlModalElement)
    Utils.configureModal(fileLoadWidget, trackWidgetModal, async fileLoadWidget => {
        const paths = fileLoadWidget.retrievePaths()
        await multipleTrackFileLoad.loadPaths(paths)
        return true
    })

    if (googleDriveButton && !googleEnabled) {
        googleDriveButton.parentElement.style.display = 'none';
    }

    const multipleTrackFileLoadConfig =
        {
            localFileInput,
            initializeDropbox,
            dropboxButton,
            googleDriveButton: googleEnabled ? googleDriveButton : undefined,
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
        createGenericSelectModalWidget(igvMain, selectModalIdOrUndefined, trackLoadHandler, trackMenuHandler)
    }

}

function createGenericSelectModalWidget(igvMain, selectModalIdOrUndefined, trackLoadHandler, trackMenuHandler) {

    const genericSelectModalElement = createGenericSelectModalElement(selectModalIdOrUndefined, `${selectModalIdOrUndefined}-select`);

    igvMain.appendChild(genericSelectModalElement)

    genericSelectModal = new bootstrap.Modal(genericSelectModalElement)

    const select = genericSelectModalElement.querySelector('select');

    const dismiss = genericSelectModalElement.querySelector('.modal-footer button:nth-child(1)');
    dismiss.addEventListener('click', () => genericSelectModal.hide())

    const ok = genericSelectModalElement.querySelector('.modal-footer button:nth-child(2)');

    const okHandler = () => {
        const configurations = [];
        const selectedOptions = select.querySelectorAll('option:checked')
        for (const option of selectedOptions) {
            const config = JSON.parse(option.dataset.track)
            configurations.push(config)
            option.selected = false
        }

        if (configurations.length > 0) {
            trackLoadHandler(configurations);
        }

        genericSelectModal.hide();
    }

    ok.addEventListener('click', okHandler);

    genericSelectModalElement.addEventListener('keypress', event => {
        if (event.key === 'Enter') {
            okHandler();
        }
    })

    genericSelectModalElement.addEventListener('show.bs.modal', () => {

        const options = genericSelectModalElement.querySelectorAll('select option')

        const trackConfigList = []
        for (const option of options) {
            const trackConfiguration = JSON.parse(option.dataset.track)
            trackConfigList.push({ element: option, trackConfiguration })
        }

        trackMenuHandler(trackConfigList)
    })

}

async function updateTrackMenusWithTrackConfigurations(genomeID, GtexUtilsOrUndefined, trackConfigurations, dropdownMenu) {

    const id_prefix = 'genome_specific_'

    const divider = dropdownMenu.querySelector('.dropdown-divider')

    const searchString = '[id^=' + id_prefix + ']'
    const foundItems = dropdownMenu.querySelectorAll(searchString)
    foundItems.forEach(item => item.remove())

    let buttonConfigurations = []

    for (const trackConfiguration of trackConfigurations) {

        if (true === supportsGenome(genomeID) && 'ENCODE' === trackConfiguration.type) {
            encodeModalTables[0].setDatasource(new GenericDataSource(encodeTrackDatasourceConfigurator(genomeID, 'signals-chip')))
            encodeModalTables[1].setDatasource(new GenericDataSource(encodeTrackDatasourceConfigurator(genomeID, 'signals-other')))
            encodeModalTables[2].setDatasource(new GenericDataSource(encodeTrackDatasourceConfigurator(genomeID, 'other')))
        }

        buttonConfigurations.push(trackConfiguration)

    }

    for (let buttonConfiguration of buttonConfigurations.reverse()) {

        if (buttonConfiguration.type && 'custom-data-modal' === buttonConfiguration.type) {

            createDropdownButton(divider, buttonConfiguration.label, id_prefix)
                .addEventListener('click', () => {

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

                createDropdownButton(divider, 'ENCODE Other', id_prefix)
                    .addEventListener('click', () => encodeModalTables[2].modal.show())

                createDropdownButton(divider, 'ENCODE Signals - Other', id_prefix)
                    .addEventListener('click', () => encodeModalTables[1].modal.show())

                createDropdownButton(divider, 'ENCODE Signals - ChIP', id_prefix)
                    .addEventListener('click', () => encodeModalTables[0].modal.show())

            }

        } else if (genericSelectModal) {

            createDropdownButton(divider, buttonConfiguration.label, id_prefix)
                .addEventListener('click', () => {
                    configureSelectModal(genericSelectModal._element, buttonConfiguration)
                    genericSelectModal.show()
                })

        }
    }
}

function createDropdownButton(divider, buttonText, id_prefix) {
    const button = document.createElement('button')
    button.className = 'dropdown-item'
    button.type = 'button'
    button.textContent = `${buttonText} ...`
    button.id = `${id_prefix}${buttonText.toLowerCase().split(' ').join('_')}`
    divider.insertAdjacentElement('afterend', button)
    return button
}

function configureSelectModal(genericSelectModalElement, buttonConfiguration) {
    // Set the modal title
    const modalTitle = genericSelectModalElement.querySelector('.modal-title');
    modalTitle.textContent = `${buttonConfiguration.label}`;

    // Get the select element and clear its options
    const select = genericSelectModalElement.querySelector('select');
    select.innerHTML = '';

    // Add options to the select element
    buttonConfiguration.tracks.forEach(configuration => {
        const option = document.createElement('option');
        option.value = configuration.name;
        option.textContent = configuration.name;
        option.dataset.track = JSON.stringify(configuration); // Store configuration as JSON string
        select.appendChild(option);
    });

    // Set the description if it exists
    if (buttonConfiguration.description) {
        const footnotes = genericSelectModalElement.querySelector('#igv-widgets-generic-select-modal-footnotes');
        footnotes.innerHTML = buttonConfiguration.description;
    }
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
        AlertSingleton.present(e.message)
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
        AlertSingleton.present(e.message)
    }

    let trackConfigurations = []
    try {
        trackConfigurations = await Promise.all(responses.map(response => response.json()))
    } catch (e) {
        AlertSingleton.present(e.message)
    }

    return trackConfigurations
}

export {
    updateTrackMenusWithTrackConfigurations,
    createTrackWidgetsWithTrackRegistry,
    getPathsWithTrackRegistryFile
}
