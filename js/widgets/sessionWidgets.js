import {FileUtils, igvxhr} from '../../node_modules/igv-utils/src/index.js'
import URLLoadWidget from './urlLoadWidget.js'
import SessionFileLoad from "./sessionFileLoad.js"
import {createURLModalElement} from './urlModal.js'
import * as Utils from './utils.js'
import alertSingleton from "./alertSingleton.js"
import * as DOMUtils from "./utils/dom-utils.js"



let urlLoadWidget
let sessionWidgetModal
let saveSessionModal

async function createSessionWidgets(rootContainer, browser, options) {

    const prefix = 'igv-webapp'
    const localFileInputId = 'igv-app-dropdown-local-session-file-input'
    const dropboxButtonId = 'igv-app-dropdown-dropbox-session-file-button'
    const googleDriveButtonId = 'igv-app-dropdown-google-drive-session-file-button'
    const urlModalId = 'igv-app-session-url-modal'
    const sessionSaveModalId = 'igv-app-session-save-modal'

    const urlModalElement = createURLModalElement(urlModalId, 'Session URL')
    rootContainer.appendChild(urlModalElement)

    const loadHandler = async config => {
        try {
            await browser.loadSession(config)
        } catch (e) {
            console.error(e)
            alertSingleton.present(e)
        }
    }

    const localFileInput = document.getElementById(`${localFileInputId}`)
    const dropboxButton = document.getElementById(`${dropboxButtonId}`)
    const googleDriveButton = document.getElementById(`${googleDriveButtonId}`)

    const sessionFileLoad = new SessionFileLoad({localFileInput, dropboxButton, googleDriveButton, loadHandler})

    sessionWidgetModal = new bootstrap.Modal(urlModalElement)


    const urlWidgetConfig =
        {
            widgetParent: urlModalElement.querySelector('.modal-body'),
            dataTitle: 'Session',
            indexTitle: undefined,
            dataOnly: true
        }

    urlLoadWidget = new URLLoadWidget(urlWidgetConfig)

    Utils.configureModal(urlLoadWidget, sessionWidgetModal, async urlLoadWidget => {
        const paths = urlLoadWidget.retrievePaths()
        const files = paths.map(path => ({path, name: FileUtils.getFilename(path)}))
        await sessionFileLoad.loadFiles(files)
        return true
    })

    const JSONProvider = () => {
        try {
            return browser.toJSON()
        } catch (e) {
            console.error(e)
            alertSingleton.present(e)
            return undefined
        }
    }
    saveSessionModal = configureSaveSessionModal(rootContainer, prefix, JSONProvider, sessionSaveModalId)

    if (options.sessionRegistryFile) {
        try {
            const sessionJson = await igvxhr.loadJson(options.sessionRegistryFile)
            createSessionMenu('igv-session-list-divider', sessionJson, loadHandler)
        } catch (e) {
            console.error(e)
            document.getElementById('igv-session-list-divider').style.display = 'none'
        }
    } else {
        document.getElementById('igv-session-list-divider').style.display = 'none'
    }

}

function configureSaveSessionModal(rootContainer, prefix, JSONProvider, sessionSaveModalId) {

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
    
    </div>`


    const fragment = document.createRange().createContextualFragment(html)
    const modalElement = fragment.firstChild

    rootContainer.appendChild(modalElement)

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

export function createSessionMenu(sessionListDivider, sessionJSON, sessionLoader) {

    const id_prefix = 'session_file'

    const searchString = `[id^=${id_prefix}]`
    const elements = document.querySelectorAll(searchString)
    if (elements.length > 0) {
        for (let i = 0; i < elements.length; i++) {
            elements[i].remove()
        }
    }

    const sessions = sessionJSON['sessions']

    for (let {label, url, description} of sessions.reverse()) {

        const referenceNode = document.getElementById(sessionListDivider)

        if (!url) {

            const section_id = `${id_prefix}_${DOMUtils.guid()}`
            const html = `<div id="${section_id}" class="dropdown-header">${label}</div>`
            const fragment = document.createRange().createContextualFragment(html)
            referenceNode.after(fragment.firstChild)

        } else {
            const button_id = `${id_prefix}_${DOMUtils.guid()}`
            const html = `<button id="${button_id}" class="dropdown-item" type="button" ${description ? `title="${description}"` : ''}>${label}</button>`
            const fragment = document.createRange().createContextualFragment(html)
            referenceNode.after(fragment.firstChild)
            const button = document.getElementById(button_id)
            button.addEventListener('click', () => {
                const config = {}
                const key = true === FileUtils.isFilePath(url) ? 'file' : 'url'
                config[key] = url

                sessionLoader(config)

            })
        }
    }
}

export {createSessionWidgets}
