import FileLoadWidget from "./fileLoadWidget.js"
import FileLoadManager from "./fileLoadManager.js"
import * as Utils from './utils.js'
import {FileUtils} from '../node_modules/igv-utils/src/index.js'

class SessionController {

    constructor({prefix, sessionLoadModal, sessionSaveModal, sessionFileLoad, JSONProvider}) {

        let config =
            {
                widgetParent: sessionLoadModal.querySelector('.modal-body'),
                dataTitle: 'Load Session',
                indexTitle: undefined,
                mode: 'url',
                fileLoadManager: new FileLoadManager(),
                dataOnly: true,
                doURL: undefined
            }

        this.urlWidget = new FileLoadWidget(config)

        // Configure load session modal
        Utils.configureModal(this.urlWidget, sessionLoadModal, async fileLoadWidget => {
            await sessionFileLoad.loadPaths(fileLoadWidget.retrievePaths())
            return true
        })

        // Configure save session modal
        configureSaveSessionModal(prefix, JSONProvider, sessionSaveModal)

    }

}


function configureSaveSessionModal(prefix, JSONProvider, sessionSaveModal) {

    let input = sessionSaveModal.querySelector('input')

    let okHandler = () => {

        const extensions = new Set(['json', 'xml'])

        let filename = input.value

        if (undefined === filename || '' === filename) {
            filename = input.getAttribute('placeholder')
        } else if (false === extensions.has(FileUtils.getExtension(filename))) {
            filename = filename + '.json'
        }

        const json = JSONProvider()
        const jsonString = JSON.stringify(json, null, '\t')
        const data = URL.createObjectURL(new Blob([jsonString], {type: "application/octet-stream"}))

        FileUtils.download(filename, data)

        $(sessionSaveModal).modal('hide')
    }

    const $ok = $(sessionSaveModal).find('.modal-footer button:nth-child(2)')
    $ok.on('click', okHandler)

    $(sessionSaveModal).on('show.bs.modal', (e) => {
        input.value = `${prefix}-session.json`
    })

    input.addEventListener('keyup', e => {

        // enter key key-up
        if (13 === e.keyCode) {
            okHandler()
        }
    })

}

export default SessionController
