import { Utils, FileLoadManager, FileLoadWidget, SessionFileLoad } from '../node_modules/igv-widgets/dist/igv-widgets.js';
import { FileUtils, IGVUtils } from '../node_modules/igv-utils/src/index.js';
import { createURLModal } from '../node_modules/igv-ui/src/index.js';

let fileLoadWidget;

// urlModalId = igv-app-session-from-url-modal
// sessionSaveModalId = igv-app-session-save-modal
const createSessionWidgets = ($igvMain, igvxhr, google, prefix, localFileInputId, dropboxButtonId, googleDriveButtonId, urlModalId, sessionSaveModalId, googleEnabled, loadHandler, JSONProvider) => {

    const $urlModal = $(createURLModal(urlModalId, 'Session URL'))
    $igvMain.append($urlModal);

    if (!googleEnabled) {
        $(`#${ googleDriveButtonId }`).parent().hide();
    }

    const fileLoadWidgetConfig =
        {
            widgetParent: $urlModal.find('.modal-body').get(0),
            dataTitle: 'Load Session',
            indexTitle: undefined,
            mode: 'url',
            fileLoadManager: new FileLoadManager(),
            dataOnly: true,
            doURL: undefined
        };

    fileLoadWidget = new FileLoadWidget(fileLoadWidgetConfig);

    const sessionFileLoadConfig =
        {
            localFileInput: document.querySelector(`#${ localFileInputId }`),
            dropboxButton: document.querySelector(`#${ dropboxButtonId }`),
            googleEnabled,
            googleDriveButton: document.querySelector(`#${ googleDriveButtonId }`),
            loadHandler,
            igvxhr,
            google
        };

    const sessionFileLoad = new SessionFileLoad(sessionFileLoadConfig)

    Utils.configureModal(fileLoadWidget, $urlModal.get(0), async fileLoadWidget => {
        await sessionFileLoad.loadPaths(fileLoadWidget.retrievePaths());
        return true;
    });

    configureSaveSessionModal($igvMain, prefix, JSONProvider, sessionSaveModalId);

}

function configureSaveSessionModal($igvMain, prefix, JSONProvider, sessionSaveModalId) {

    const modal =
        `<div id="${ sessionSaveModalId }" class="modal fade igv-app-file-save-modal">

            <div class="modal-dialog modal-lg">
    
                <div class="modal-content">
    
                    <div class="modal-header">
    
                        <div class="modal-title">
                            <div>
                                Save Session File
                            </div>
                        </div>
    
                        <button type="button" class="close" data-dismiss="modal">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
    
                    <div class="modal-body">
                        <input class="form-control" type="text" placeholder="igv-app-session.json">
    
                        <div>
                            Enter session filename with .json suffix
                        </div>
    
                    </div>
    
                    <div class="modal-footer">
                        <button type="button" class="btn btn-sm btn-outline-secondary" data-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-sm btn-secondary">OK</button>
                    </div>
    
                </div>
    
            </div>
    
        </div>`

    const $modal = $(modal)
    $igvMain.append($modal);

    let $input = $modal.find('input');

    let okHandler = () => {

        const extensions = new Set(['json', 'xml']);

        let filename = $input.val();

        if (undefined === filename || '' === filename) {
            filename = $input.attr('placeholder');
        } else if (false === extensions.has(FileUtils.getExtension(filename))) {
            filename = filename + '.json';
        }

        const json = JSONProvider();
        const jsonString = JSON.stringify(json, null, '\t');
        const data = URL.createObjectURL(new Blob([jsonString], {type: "application/octet-stream"}));

        IGVUtils.download(filename, data);

        $modal.modal('hide');
    };

    const $ok = $modal.find('.modal-footer button:nth-child(2)');
    $ok.on('click', okHandler);

    $modal.on('show.bs.modal', (e) => {
        $input.val(`${ prefix }-session.json`);
    });

    $input.on('keyup', e => {

        // enter key
        if (13 === e.keyCode) {
            okHandler();
        }
    });

}

export { createSessionWidgets }
