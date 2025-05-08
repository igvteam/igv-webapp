import URLLoadWidget from "./urlLoadWidget.js"
import * as Utils from "./utils.js"
import alertSingleton from "./alertSingleton.js"
import {initializeDropbox} from "./dropbox.js"
import * as GooglePicker from "../../node_modules/igv-utils/src/google-utils/googleFilePicker.js"

let sampleInfoURLModal

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

    // local file
    localFileInput.addEventListener('change', async () => {

        const {files} = localFileInput

        const paths = Array.from(files)

        localFileInput.value = ''

        await sampleInfoFileLoadHandler({url: paths[0]})
    })

    //  Dropbox
    if (dropboxButton) dropboxButton.addEventListener('click', async () => {

        const result = await initializeDropbox()

        if (true === result) {

            const obj =
                {
                    success: dbFiles => {

                        const configList = dbFiles.map(({link}) => {
                            return {url: link}
                        })

                        sampleInfoFileLoadHandler(configList[0])
                    },
                    cancel: () => {
                    },
                    linkType: "preview",
                    multiselect: false,
                    folderselect: false,
                }

            Dropbox.choose(obj)

        } else {
            alertSingleton.present('Cannot connect to Dropbox')
        }
    })

    // Google Drive
    if (googleDriveButton) {
        googleDriveButton.addEventListener('click', () => {

            const filePickerHandler = async responses => {
                const paths = responses.map(({url}) => url)
                await sampleInfoFileLoadHandler({url: paths[0]})
            }

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
    </div>`

    const fragment = document.createRange().createContextualFragment(html)
    const urlModalElement = fragment.firstChild

    igvMain.appendChild(urlModalElement)

    const fileLoadWidgetConfig =
        {
            widgetParent: urlModalElement.querySelector('.modal-body'),
            dataTitle: 'Sample Info',
            indexTitle: 'Index',
            dataOnly: true
        }

    const fileLoadWidget = new URLLoadWidget(fileLoadWidgetConfig)

    sampleInfoURLModal = new bootstrap.Modal(urlModalElement)
    Utils.configureModal(fileLoadWidget, sampleInfoURLModal, async fileLoadWidget => {
        const paths = fileLoadWidget.retrievePaths()
        await sampleInfoFileLoadHandler({url: paths[0]})
        return true
    })
}