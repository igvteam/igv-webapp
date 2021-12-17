/*
 *  The MIT License (MIT)
 *
 * Copyright (c) 2016-2017 The Regents of the University of California
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the
 * following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
 * BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

import {DOMUtils, FileUtils, GoogleAuth, igvxhr, makeDraggable} from '../node_modules/igv-utils/src/index.js'
import {
    AlertSingleton,
    createSessionWidgets,
    createTrackWidgetsWithTrackRegistry,
    dropboxButtonImageBase64,
    dropboxDropdownItem,
    EventBus,
    GenomeFileLoad,
    googleDriveButtonImageBase64,
    googleDriveDropdownItem,
    updateTrackMenus
} from '../node_modules/igv-widgets/dist/igv-widgets.js'
import Globals from "./globals.js"
import {createGenomeWidgets, initializeGenomeWidgets, loadGenome} from './genomeWidgets.js'
import {createShareWidgets, shareWidgetConfigurator} from './shareWidgets.js'
import {sessionURL} from './shareHelper.js'
import {createSVGWidget} from './svgWidget.js'
import GtexUtils from "./gtexUtils.js"
import version from "./version.js"
import {createCircularViewResizeModal} from "./circularViewResizeModal.js"

$(document).ready(async () => main(document.getElementById('igv-app-container'), igvwebConfig))

let dropboxEnabled = false
let googleEnabled = false
let currentGenomeId
let circularView

async function main(container, config) {

    AlertSingleton.init(container)

    $('#igv-app-version').text(`IGV-Web app version ${version()}`)
    $('#igv-igvjs-version').text(`igv.js version ${igv.version()}`)

    const enableGoogle = (config.clientId || config.apiKey) &&
        (window.location.protocol === "https:" || window.location.host === "localhost")

    if (enableGoogle) {

        try {
            await GoogleAuth.init({
                client_id: config.clientId,
                apiKey: config.apiKey,
                scope: 'https://www.googleapis.com/auth/userinfo.profile',
            })
            googleEnabled = true
        } catch (e) {
            console.error(e)
            AlertSingleton.present(e.message)
        }

        const isSignedIn = gapi.auth2.getAuthInstance().isSignedIn.get()
        if (true === isSignedIn) {
            const user = gapi.auth2.getAuthInstance().currentUser.get()
            queryGoogleAuthenticationStatus(user, isSignedIn)
        }

        gapi.auth2.getAuthInstance().isSignedIn.listen(status => {
            const user = gapi.auth2.getAuthInstance().currentUser.get()
            queryGoogleAuthenticationStatus(user, status)
        })

    }

    // Load genomes for use by igv.js and webapp
    if (config.genomes) {
        let tmp = await getGenomesArray(config.genomes)
        config.genomes = tmp
        config.igvConfig.genomes = tmp
    }

    const igvConfig = config.igvConfig

    if (config.restoreLastGenome) {
        const lastGenomeId = localStorage.getItem("genomeID")
        if (lastGenomeId && lastGenomeId !== igvConfig.genome) {
            igvConfig.genome = lastGenomeId
            igvConfig.tracks = []
        }
    }


    const browser = await igv.createBrowser(container, igvConfig)

    if (browser) {
        Globals.browser = browser
        await initializationHelper(browser, container, config)
    }
}

async function initializationHelper(browser, container, options) {

    if (true === googleEnabled) {

        const toggle = document.querySelector('#igv-google-drive-dropdown-toggle')

        const button = document.querySelector('#igv-google-drive-sign-out-button')

        button.addEventListener('click', async () => {
            await GoogleAuth.signOut()
            toggle.style.display = 'none'
        })

    }

    ['track', 'genome'].forEach(str => {
        let imgElement

        imgElement = document.querySelector(`img#igv-app-${str}-dropbox-button-image`)
        if (options.dropboxAPIKey) {
            imgElement.src = `data:image/svg+xml;base64,${dropboxButtonImageBase64()}`
        } else {
            imgElement = document.querySelector(`#igv-app-dropdown-dropbox-${str}-file-button`)
            imgElement.parentElement.style.display = 'none'
        }

        imgElement = document.querySelector(`img#igv-app-${str}-google-drive-button-image`)
        imgElement.src = `data:image/svg+xml;base64,${googleDriveButtonImageBase64()}`
    })

    if (options.dropboxAPIKey) {
        $('div#igv-session-dropdown-menu > :nth-child(1)').after(dropboxDropdownItem('igv-app-dropdown-dropbox-session-file-button'))
    }

    $('div#igv-session-dropdown-menu > :nth-child(2)').after(googleDriveDropdownItem('igv-app-dropdown-google-drive-session-file-button'))

    const $igvMain = $('#igv-main')

    const genomeFileLoadConfig =
        {
            localFileInput: document.getElementById('igv-app-dropdown-local-genome-file-input'),
            initializeDropbox,
            dropboxButton: options.dropboxAPIKey ? document.getElementById('igv-app-dropdown-dropbox-genome-file-button') : undefined,
            googleEnabled,
            googleDriveButton: document.getElementById('igv-app-dropdown-google-drive-genome-file-button'),
            loadHandler: async configuration => {

                if (configuration.id !== browser.genome.id) {
                    await loadGenome(configuration)
                }

            },
            igvxhr
        }

    createGenomeWidgets({
        $igvMain,
        urlModalId: 'igv-app-genome-from-url-modal',
        genomeFileLoad: new GenomeFileLoad(genomeFileLoadConfig)
    })

    await initializeGenomeWidgets(browser, options.genomes, $('#igv-app-genome-dropdown-menu'))

    const trackLoader = async configurations => {
        try {
            await browser.loadTrackList(configurations)
        } catch (e) {
            console.error(e)
            AlertSingleton.present(e)
        }
    }

    createTrackWidgetsWithTrackRegistry($igvMain,
        $('#igv-app-track-dropdown-menu'),
        $('#igv-app-dropdown-local-track-file-input'),
        initializeDropbox,
        options.dropboxAPIKey ? $('#igv-app-dropdown-dropbox-track-file-button') : undefined,
        googleEnabled,
        $('#igv-app-dropdown-google-drive-track-file-button'),
        ['igv-app-encode-signal-modal', 'igv-app-encode-others-modal'],
        'igv-app-track-from-url-modal',
        'igv-app-track-select-modal',
        GtexUtils,
        options.trackRegistryFile,
        trackLoader)

    const sessionSaver = () => {
        try {
            return browser.toJSON()
        } catch (e) {
            console.error(e)
            AlertSingleton.present(e)
            return undefined
        }
    }

    const sessionLoader = async config => {
        try {
            await browser.loadSession(config)
        } catch (e) {
            console.error(e)
            AlertSingleton.present(e)
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

    createSVGWidget({browser, saveModal: document.getElementById('igv-app-svg-save-modal')})

    createShareWidgets(shareWidgetConfigurator(browser, container, options))

    createAppBookmarkHandler($('#igv-app-bookmark-button'))

    const genomeChangeListener = async event => {

        const {data: genomeID} = event

        if (currentGenomeId !== genomeID) {

            currentGenomeId = genomeID

            await updateTrackMenus(genomeID, undefined, options.trackRegistryFile, $('#igv-app-track-dropdown-menu'))

            if (options.sessionRegistryFile) {
                await updateSessionMenu(genomeID, 'igv-session-list-divider', options.sessionRegistryFile, sessionLoader)
            }
        }
    }

    if (true === circularViewIsInstalled()) {

        const circularViewContainer = document.getElementById('igv-circular-view-container')

        browser.createCircularView(circularViewContainer, false)

        makeDraggable(circularViewContainer, browser.circularView.toolbar)

        browser.circularView.setSize(512)

        document.getElementById('igv-app-circular-view-nav-item').style.display = 'block'

        const dropdownButton = document.getElementById('igv-app-circular-view-dropdown-button')
        dropdownButton.addEventListener('click', e => {

            document.getElementById('igv-app-circular-view-presentation-button').innerText = browser.circularViewVisible ? 'Hide' : 'Show'

            document.getElementById('igv-app-circular-view-resize-button').style.display = browser.circularViewVisible ? 'block' : 'none'
            document.getElementById('igv-app-circular-view-clear-chords-button').style.display = browser.circularViewVisible ? 'block' : 'none'
        })

        document.getElementById('igv-app-circular-view-presentation-button').addEventListener('click', e => {
            browser.circularViewVisible = !browser.circularViewVisible
            const str = e.target.innerText
            e.target.innerText = 'Show' === str ? 'Hide' : 'Show'
        })

        document.getElementById('igv-app-circular-view-clear-chords-button').addEventListener('click', () => browser.circularView.clearChords())

        document.getElementById('igv-main').appendChild(createCircularViewResizeModal('igv-app-circular-view-resize-modal', 'Resize Circular View'))

        document.getElementById('igv-app-circular-view-resize-modal-input').addEventListener('keyup', (event) => {
            event.preventDefault()
            event.stopPropagation()
            if (13 === event.keyCode) {
                browser.circularView.setSize(Number.parseInt(event.target.value))
            }
        })

        $('#igv-app-circular-view-resize-modal').on('shown.bs.modal', () => document.getElementById('igv-app-circular-view-resize-modal-input').value = circularViewContainer.clientWidth.toString())

    }


    EventBus.globalBus.subscribe("DidChangeGenome", genomeChangeListener)

    EventBus.globalBus.post({type: "DidChangeGenome", data: browser.genome.id})
}


function queryGoogleAuthenticationStatus(user, isSignedIn) {

    if (true === isSignedIn) {

        const profile = user.getBasicProfile()
        const emailAddress = profile.getEmail()

        const toggle = document.querySelector('#igv-google-drive-dropdown-toggle')
        toggle.style.display = 'block'

        const button = document.querySelector('#igv-google-drive-sign-out-button')
        button.innerHTML = `Sign Out ${emailAddress}`
    }
}

async function updateSessionMenu(genomeID, sessionListDivider, sessionRegistryFile, sessionLoader) {

    let response = undefined
    try {
        response = await fetch(sessionRegistryFile)
    } catch (e) {
        console.error(e)
    }

    let sessionRegistry = undefined
    if (response) {
        sessionRegistry = await response.json()
    } else {
        const e = new Error("Error retrieving session registry")
        AlertSingleton.present(e.message)
        throw e
    }

    const id_prefix = 'genome_specific_session_file'

    const searchString = `[id^=${id_prefix}]`
    const elements = document.querySelectorAll(searchString)
    if (elements.length > 0) {
        for (let i = 0; i < elements.length; i++) {
            elements[i].remove()
        }
    }

    const sessions = sessionRegistry[genomeID]
    if (sessions) {

        for (let {name, url} of sessionRegistry[genomeID]) {

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

function sendPairedAlignmentChord(features) {
    circularView.selectAlignmentChord(features[0])
}

function sendBedPEChords(features) {
    circularView.addBedPEChords(features)
}

function createAppBookmarkHandler($bookmark_button) {

    $bookmark_button.on('click', (e) => {

        let url = undefined
        try {
            url = sessionURL()
        } catch (e) {
            AlertSingleton.present(e.message)
        }

        if (url) {
            window.history.pushState({}, "IGV", url)

            const str = (/Mac/i.test(navigator.userAgent) ? 'Cmd' : 'Ctrl')
            const blurb = 'A bookmark URL has been created. Press ' + str + '+D to save.'
            alert(blurb)
        }
    })
}

async function getGenomesArray(genomes) {

    if (undefined === genomes) {
        return undefined
    }
    if (Array.isArray(genomes)) {
        return genomes
    } else {

        let response = undefined
        try {
            response = await fetch(genomes)
            return response.json()
        } catch (e) {
            AlertSingleton.present(e.message)
        }
    }
}

let didCompleteOneAttempt = false

async function initializeDropbox() {

    if (true === didCompleteOneAttempt && false === dropboxEnabled) {
        return Promise.resolve(false)
    } else if (true === dropboxEnabled) {
        return Promise.resolve(true)
    } else {
        return new Promise((resolve, reject) => {

            didCompleteOneAttempt = true

            const dropbox = document.createElement('script')

            // dropbox.setAttribute('src', 'http://localhost:9999');
            dropbox.setAttribute('src', 'https://www.dropbox.com/static/api/2/dropins.js')
            dropbox.setAttribute('id', 'dropboxjs')
            dropbox.dataset.appKey = igvwebConfig.dropboxAPIKey
            dropbox.setAttribute('type', "text/javascript")

            document.head.appendChild(dropbox)

            dropbox.addEventListener('load', () => {
                dropboxEnabled = true
                resolve(true)
            })

        })
    }
}

function circularViewIsInstalled() {
    return window["JBrowseReactCircularGenomeView"] !== undefined && window["React"] !== undefined && window["ReactDOM"] !== undefined
}

export {main}
