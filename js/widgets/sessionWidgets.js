import {FileUtils} from '../../node_modules/igv-utils/src/index.js'
import FileLoadManager from './fileLoadManager.js'
import URLLoadWidget from './urlLoadWidget.js'
import SessionFileLoad from "./sessionFileLoad.js"
import {createURLModalElement} from './urlModal.js'
import * as Utils from './utils.js'

let fileLoadWidget
let sessionWidgetModal
let saveSessionModal
function createSessionWidgets($rootContainer,
                              prefix,
                              localFileInputId,
                              initializeDropbox,
                              dropboxButtonId,
                              googleDriveButtonId,
                              urlModalId,
                              sessionSaveModalId,
                              googleEnabled,
                              loadHandler,
                              JSONProvider) {

    const urlModalElement = createURLModalElement(urlModalId, 'Session URL')
    $rootContainer.get(0).appendChild(urlModalElement)

    if (!googleEnabled) {
        $(`#${googleDriveButtonId}`).parent().hide()
    }

    const fileLoadWidgetConfig =
        {
            widgetParent: urlModalElement.querySelector('.modal-body'),
            dataTitle: 'Session',
            indexTitle: undefined,
            fileLoadManager: new FileLoadManager(),
            dataOnly: true
        }

    fileLoadWidget = new URLLoadWidget(fileLoadWidgetConfig)

    const sessionFileLoadConfig =
        {
            localFileInput: document.querySelector(`#${localFileInputId}`),
            initializeDropbox,
            dropboxButton: dropboxButtonId ? document.querySelector(`#${dropboxButtonId}`) : undefined,
            googleEnabled,
            googleDriveButton: document.querySelector(`#${googleDriveButtonId}`),
            loadHandler
        }

    const sessionFileLoad = new SessionFileLoad(sessionFileLoadConfig)

    sessionWidgetModal = new bootstrap.Modal(urlModalElement)
    Utils.configureModal(fileLoadWidget, sessionWidgetModal, async fileLoadWidget => {
        await sessionFileLoad.loadPaths(fileLoadWidget.retrievePaths())
        return true
    })

    saveSessionModal = configureSaveSessionModal($rootContainer, prefix, JSONProvider, sessionSaveModalId)

}

function configureSaveSessionModal($rootContainer, prefix, JSONProvider, sessionSaveModalId) {

    const html =
    `<div id="${sessionSaveModalId}" class="modal fade igv-app-file-save-modal" tabindex="-1">

        <div class="modal-dialog modal-lg">
    
            <div class="modal-content">
    
                <div class="modal-header">
    
                    <div class="modal-title">
                        <div>
                            Save Session File
                        </div>
                    </div>
    
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
    
                <div class="modal-body">
                    <input class="form-control" type="text" placeholder="igv-app-session.json">
    
                    <div>
                        Enter session filename with .json suffix
                    </div>
    
                </div>
    
                <div class="modal-footer">
                    <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-sm btn-secondary">OK</button>
                </div>
    
            </div>
    
        </div>
    
    </div>`;


    const fragment = document.createRange().createContextualFragment(html)
    const modalElement = fragment.firstChild

    $rootContainer.get(0).appendChild(modalElement)

    const modal = new bootstrap.Modal(modalElement)

    const inputElement = modalElement.querySelector('input')
    const $input = $(inputElement)

    modalElement.addEventListener('show.bs.modal', () => $input.val(`${prefix}-session.json`))

    const okHandler = () => {

        const extensions = new Set(['json', 'xml'])

        let filename = $input.val()

        if (undefined === filename || '' === filename) {
            filename = $input.attr('placeholder')
        } else if (false === extensions.has(FileUtils.getExtension(filename))) {
            filename = filename + '.json'
        }

        const json = JSONProvider()

        if (json) {
            const jsonString = JSON.stringify(json, null, '\t')
            const data = URL.createObjectURL(new Blob([jsonString], {type: "application/octet-stream"}))
            FileUtils.download(filename, data)
        }

        modal.hide()
    }

    const okElement = modalElement.querySelector('.modal-footer button:nth-child(2)')
    okElement.addEventListener('click', () => okHandler())

    inputElement.addEventListener('keyup', e => {
        // enter key
        if (13 === e.keyCode) {
            okHandler()
        }
    })

    return modal
}

export {createSessionWidgets}
