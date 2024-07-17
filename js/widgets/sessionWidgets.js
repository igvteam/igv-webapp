import {FileUtils} from '../../node_modules/igv-utils/src/index.js'
import FileLoadManager from './fileLoadManager.js'
import FileLoadWidget from './fileLoadWidget.js'
import SessionFileLoad from "./sessionFileLoad.js"
import {createURLModalElement} from './urlModal.js'
import * as Utils from './utils.js'

let fileLoadWidget

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
            mode: 'url',
            fileLoadManager: new FileLoadManager(),
            dataOnly: true,
            doURL: undefined
        }

    fileLoadWidget = new FileLoadWidget(fileLoadWidgetConfig)

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

    Utils.configureModal(fileLoadWidget, new bootstrap.Modal(urlModalElement), async fileLoadWidget => {
        await sessionFileLoad.loadPaths(fileLoadWidget.retrievePaths())
        return true
    })

    configureSaveSessionModal($rootContainer, prefix, JSONProvider, sessionSaveModalId)

}

function configureSaveSessionModal($rootContainer, prefix, JSONProvider, sessionSaveModalId) {

    const modal =
        `<div id="${sessionSaveModalId}" class="modal fade igv-app-file-save-modal">

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
    $rootContainer.append($modal)

    let $input = $modal.find('input')

    let okHandler = () => {

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

        $modal.modal('hide')
    }

    const $ok = $modal.find('.modal-footer button:nth-child(2)')
    $ok.on('click', okHandler)

    $modal.on('show.bs.modal', (e) => {
        $input.val(`${prefix}-session.json`)
    })

    $input.on('keyup', e => {

        // enter key
        if (13 === e.keyCode) {
            okHandler()
        }
    })

}

export {createSessionWidgets}
