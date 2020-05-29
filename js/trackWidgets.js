import {FileLoadManager, FileLoadWidget, MultipleTrackFileLoad, Utils} from '../node_modules/igv-widgets/dist/igv-widgets.js';
import {ModalTable} from '../node_modules/data-modal/js/index.js';
import {updateTrackMenus} from './trackMenu.js';
import {eventBus} from "./app.js";

let fileLoadWidget;
let multipleTrackFileLoad;
let encodeModalTable;

const createTrackWidgets = async (browser, googleEnabled, igvxhr, google, {trackRegistryFile}) => {

    const $urlModal = $('#igv-app-track-from-url-modal')

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
            id: 'igv-app-encode-modal',
            title: 'ENCODE',
            selectionStyle: 'multi',
            pageLength: 100,
            selectHandler: async configurations => await browser.loadTrackList( configurations )
        };

    encodeModalTable = new ModalTable(encodeModalTableConfig)

    await updateTrackMenus(browser.genome.id, encodeModalTable, trackRegistryFile, $('#igv-app-track-dropdown-menu'), $('#igv-app-generic-track-select-modal'), configuration => browser.loadTrack(configuration));

    const genomeChangeListener = {

        receiveEvent: async ({ data }) => {

            const { genomeID } = data;
            await updateTrackMenus(genomeID, encodeModalTable, trackRegistryFile, $('#igv-app-track-dropdown-menu'), $('#igv-app-generic-track-select-modal'), configuration => browser.loadTrack(configuration));
        }
    }

    eventBus.subscribe('DidChangeGenome', genomeChangeListener);

}

export { createTrackWidgets }
