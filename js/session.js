import {AlertSingleton, createSessionWidgets} from "../node_modules/igv-widgets/dist/igv-widgets.js"
import {DOMUtils, FileUtils} from '../node_modules/igv-utils/src/index.js'

async function configureSessionWidgets({ $igvMain, browser, initializeDropbox, options, googleEnabled }) {

    const sessionSaver = () => {
        return {
            "juicebox": browser.juiceboxPanel.browser.toJSON(),
            "igv": browser.toJSON()
        }
    }

    const sessionLoader = async session => {

        const igvConfig = session.igv || session

        try {
            await browser.loadSession(igvConfig)
        } catch (e) {
            console.error(e)
            AlertSingleton.present(e)
        }

        if (session.juicebox && 0 !== Object.entries(session.juicebox).length) {

            try {
                await browser.juiceboxPanel.loadSession(session.juicebox)
            } catch (e) {
                console.error(e)
                AlertSingleton.present(e)
            }

        }
    }

    createSessionWidgets($igvMain,
        'igv-webapp',
        'igv-app-dropdown-local-session-file-input',
        initializeDropbox,
        options.dropboxAPIKey ? 'igv-app-dropdown-dropbox-session-file-button' : undefined,
        'igv-app-dropdown-google-drive-session-file-button',
        'igv-app-session-url-modal',
        'igv-app-session-save-modal',
        googleEnabled,
        sessionLoader,
        sessionSaver)

    if (options.sessionRegistryFile) {
        await createSessionMenu('igv-session-list-divider', options.sessionRegistryFile, sessionLoader)
    } else {
        document.querySelector('#igv-session-list-divider').style.display = 'none'
    }

}

async function createSessionMenu(sessionListDivider, sessionRegistryFile, sessionLoader) {

    let response = undefined
    try {
        response = await fetch(sessionRegistryFile)
    } catch (e) {
        console.error(e)
    }

    let sessionJSON = undefined
    if (response) {
        sessionJSON = await response.json()
    } else {
        const e = new Error("Error retrieving session registry")
        AlertSingleton.present(e.message)
        throw e
    }

    const id_prefix = 'session_file'

    const searchString = `[id^=${id_prefix}]`
    const elements = document.querySelectorAll(searchString)
    if (elements.length > 0) {
        for (let i = 0; i < elements.length; i++) {
            elements[i].remove()
        }
    }

    if (sessionJSON) {

        const sessions = sessionJSON['sessions']

        for (let {name, url} of sessions.reverse()) {

            const referenceNode = document.getElementById(sessionListDivider)

            const button_id = `${id_prefix}_${DOMUtils.guid()}`
            const html = `<button id="${button_id}" class="dropdown-item" type="button">${name}</button>`
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

export { configureSessionWidgets }
