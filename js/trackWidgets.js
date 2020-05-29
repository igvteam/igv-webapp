import { Alert, FileLoadManager, FileLoadWidget, MultipleTrackFileLoad, Utils } from '../node_modules/igv-widgets/dist/igv-widgets.js';
import { EncodeDataSource, ModalTable } from '../node_modules/data-modal/js/index.js';
import { GtexUtils } from '../node_modules/igv-utils/src/index.js';
import { createGenericSelectModal, createTrackURLModal } from '../node_modules/igv-ui/src/index.js'
import {eventBus} from "./app.js";

let fileLoadWidget;
let multipleTrackFileLoad;
let encodeModalTable;

const createTrackWidgets = async ($igvMain, browser, $dropdownMenu, encodeTrackModalId, urlModalId, selectModalId, googleEnabled, igvxhr, google, { trackRegistryFile }) => {

    const $genericSelectModal = $(createGenericSelectModal(selectModalId, `${ selectModalId }-select`));
    $igvMain.append($genericSelectModal);

    const $urlModal = $(createTrackURLModal(urlModalId))
    $igvMain.append($urlModal);

    let fileLoadWidgetConfig =
        {
            widgetParent: $urlModal.find('.modal-body').get(0),
            dataTitle: 'Track',
            indexTitle: 'Track Index',
            mode: 'url',
            fileLoadManager: new FileLoadManager(),
            dataOnly: false,
            doURL: true
        };

    fileLoadWidget = new FileLoadWidget(fileLoadWidgetConfig)

    Utils.configureModal(fileLoadWidget, $urlModal.get(0), async fileLoadWidget => {
        const paths = fileLoadWidget.retrievePaths();
        await multipleTrackFileLoad.loadPaths( paths );
        return true;
    });

    let $igv_app_dropdown_google_drive_track_file_button = $('#igv-app-dropdown-google-drive-track-file-button');
    if (!googleEnabled) {
        $igv_app_dropdown_google_drive_track_file_button.parent().hide();
    }

    const $googleDriveButton = googleEnabled ? $igv_app_dropdown_google_drive_track_file_button : undefined;

    const multipleTrackFileLoadConfig =
        {
            $localFileInput: $('#igv-app-dropdown-local-track-file-input'),
            $dropboxButton: $('#igv-app-dropdown-dropbox-track-file-button'),
            $googleDriveButton,
            fileLoadHandler: async configurations => await browser.loadTrackList(configurations),
            multipleFileSelection: true,
            igvxhr,
            google
        };

    multipleTrackFileLoad = new MultipleTrackFileLoad(multipleTrackFileLoadConfig)

    const encodeModalTableConfig =
        {
            id: encodeTrackModalId,
            title: 'ENCODE',
            selectionStyle: 'multi',
            pageLength: 100,
            selectHandler: async configurations => await browser.loadTrackList( configurations )
        };

    encodeModalTable = new ModalTable(encodeModalTableConfig)

    await updateTrackMenus(browser.genome.id, encodeModalTable, trackRegistryFile, $dropdownMenu, $genericSelectModal, configuration => browser.loadTrack(configuration));

    const genomeChangeListener = {

        receiveEvent: async ({ data }) => {

            const { genomeID } = data;
            await updateTrackMenus(genomeID, encodeModalTable, trackRegistryFile, $dropdownMenu, $genericSelectModal, configuration => browser.loadTrack(configuration));
        }
    }

    eventBus.subscribe('DidChangeGenome', genomeChangeListener);

}

const updateTrackMenus = async (genomeID, encodeModalTable, trackRegistryFile, $dropdownMenu, $genericSelectModal, fileLoader) => {

    const id_prefix = 'genome_specific_';

    const $divider = $dropdownMenu.find('#igv-app-annotations-section');

    const searchString = '[id^=' + id_prefix + ']';
    const $found = $dropdownMenu.find(searchString);
    $found.remove();

    const paths = await getPathsWithTrackRegistryFile(genomeID, trackRegistryFile);

    if (undefined === paths) {
        console.warn(`There are no tracks in the track registryy for genome ${ genomeID }`);
        return;
    }

    let responses = [];
    try {
        responses = await Promise.all( paths.map( path => fetch(path) ) )
    } catch (e) {
        Alert.presentAlert(e.message);
    }

    let jsons = [];
    try {
        jsons = await Promise.all( responses.map( response => response.json() ) )
    } catch (e) {
        Alert.presentAlert(e.message);
    }

    let buttonConfigurations = [];

    for (let json of jsons) {

        if ('ENCODE' === json.type) {

            const datasource = new EncodeDataSource(json.genomeID);
            encodeModalTable.setDatasource(datasource)
            buttonConfigurations.push(json);

        } else if ('GTEX' === json.type) {

            let info = undefined;
            try {
                info = await GtexUtils.getTissueInfo(json.datasetId);
            } catch (e) {
                Alert.presentAlert(e.message);
            }

            if (info) {
                json.tracks = info.tissueInfo.map(tissue => GtexUtils.trackConfiguration(tissue));
                buttonConfigurations.push(json);
            }

        } else {
            buttonConfigurations.push(json);
        }

    } // for (json)

    buttonConfigurations = buttonConfigurations.reverse();
    for (let buttonConfiguration of buttonConfigurations) {

        const $button = $('<button>', {class: 'dropdown-item', type: 'button'});
        const str = buttonConfiguration.label + ' ...';
        $button.text(str);

        const id = id_prefix + buttonConfiguration.label.toLowerCase().split(' ').join('_');
        $button.attr('id', id);

        $button.insertAfter($divider);

        $button.on('click', () => {

            if ('ENCODE' === buttonConfiguration.type) {
                encodeModalTable.$modal.modal('show');
            } else {
                configureSelectModal($genericSelectModal, buttonConfiguration, fileLoader);
                $genericSelectModal.modal('show');
            }

        });

    } // for (buttonConfiguration)


};

const configureSelectModal = ($genericSelectModal, buttonConfiguration, fileLoader) => {

    let markup = `<div>${ buttonConfiguration.label }</div>`

    if (buttonConfiguration.description) {
        markup += `<div>${ buttonConfiguration.description }</div>`
    }

    $genericSelectModal.find('.modal-title').html(markup);

    $genericSelectModal.find('select').remove();

    let $select = $('<select>', {class: 'form-control'});
    $genericSelectModal.find('.form-group').append($select);

    let $option = $('<option>', {text: 'Select...'});
    $select.append($option);

    $option.attr('selected', 'selected');
    $option.val(undefined);

    buttonConfiguration.tracks.reduce(($accumulator, configuration) => {

        $option = $('<option>', {value: configuration.name, text: configuration.name});
        $select.append($option);

        $option.data('track', configuration);

        $accumulator.append($option);

        return $accumulator;
    }, $select);

    $select.on('change', () => {

        let $option = $select.find('option:selected');
        const value = $option.val();

        if ('' === value) {
            // do nothing
        } else {

            $option.removeAttr("selected");

            const configuration = $option.data('track');

            fileLoader(configuration)
        }

        $genericSelectModal.modal('hide');

    });

}

const getPathsWithTrackRegistryFile = async (genomeID, trackRegistryFile) => {

    let response = undefined;
    try {
        response = await fetch(trackRegistryFile);
    } catch (e) {
        console.error(e);
    }

    let trackRegistry = undefined
    if (response) {
        trackRegistry = await response.json();
    } else {
        const e = new Error("Error retrieving registry via getPathsWithTrackRegistryFile()");
        Alert.presentAlert(e.message);
        throw e;
    }

    return trackRegistry[ genomeID ]

}

export { createTrackWidgets }
