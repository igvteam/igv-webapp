import URLLoadWidget from "./urlLoadWidget.js"
import * as Utils from "./utils.js"
import alertSingleton from "./alertSingleton.js"
import {initializeDropbox} from "./dropbox.js"
import * as GooglePicker from "../../node_modules/igv-utils/src/google-utils/googleFilePicker.js"

/**
 *  Create the sample info load widgets (local file, Dropbox, Google Drive, URL) and associated event handlers.
 *
 * @param igvMain
 * @param browser
 */
export function createSampleInfoWidgets(igvMain, browser) {

    const localFileInput = document.getElementById('igv-app-sample-info-dropdown-local-track-file-input')
    const dropboxButton = document.getElementById('igv-app-dropdown-dropbox-sample-info-file-button')
    const googleDriveButton = document.getElementById('igv-app-dropdown-google-drive-sample-info-file-button')
    const urlModalId = 'igv-app-sample-info-from-url-modal'

    const sampleInfoFileLoadHandler = async configuration => {
        try {
            await browser.loadSampleInfo(configuration)
        } catch (e) {
            console.error(e)
            alertSingleton.present(e)
        }
    }

    // Local file
    localFileInput.addEventListener('change', async () => {
        const {files} = localFileInput
        if (files.length > 0) {
            const paths = Array.from(files)
            localFileInput.value = ''
            await sampleInfoFileLoadHandler({url: paths[0]})
        }
    })

    // Dropbox
    if (dropboxButton) {
        dropboxButton.addEventListener('click', async () => {
            const result = await initializeDropbox()
            if (result) {
                Dropbox.choose({
                    success: dbFiles => {
                        if (dbFiles.length > 0) {
                            const config = {url: dbFiles[0].link}
                            sampleInfoFileLoadHandler(config)
                        }
                    },
                    cancel: () => {
                    },
                    linkType: "preview",
                    multiselect: false,
                    folderselect: false,
                })
            } else {
                alertSingleton.present('Cannot connect to Dropbox')
            }
        })
    }

    // Google Drive
    if (googleDriveButton) {
        googleDriveButton.addEventListener('click', () => {
            const filePickerHandler = async responses => {
                if (responses?.length > 0) {
                    const {id} = responses[0]
                    const path = `https://www.googleapis.com/drive/v3/files/${id}?alt=media&supportsTeamDrives=true`
                    await sampleInfoFileLoadHandler({url: path})
                }
            }
            // The first argument `false` disables multi-selection.
            GooglePicker.createDropdownButtonPicker(false, filePickerHandler)
        })
    }

    // URL
    createSampleInfoURLWidget(urlModalId, igvMain, sampleInfoFileLoadHandler)
}

function createSampleInfoURLWidget(urlModalId, igvMain, sampleInfoFileLoadHandler) {

    const html =
        `<div id="${urlModalId}" class="modal fade" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-title">Sample Info URL</div>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
    
                <div class="modal-body">
                </div>
    
                <div class="modal-footer">
                    <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">OK</button>
                </div>
            </div>
        </div>
    </div>`;

    const fragment = document.createRange().createContextualFragment(html);
    const urlModalElement = fragment.firstChild;

    igvMain.appendChild(urlModalElement);

    const urlWidgetConfig = {
        widgetParent: urlModalElement.querySelector('.modal-body'),
        dataTitle: 'Sample Info',
        indexTitle: 'Index',
        dataOnly: true
    };

    const urlLoadWidget = new URLLoadWidget(urlWidgetConfig);

    const sampleInfoURLModal = new bootstrap.Modal(urlModalElement);

    Utils.configureModal(urlLoadWidget, sampleInfoURLModal, async fileLoadWidget => {
        const paths = fileLoadWidget.retrievePaths();
        if (paths?.length > 0) {
            await sampleInfoFileLoadHandler({ url: paths[0] });
        }
        return true;
    });
}