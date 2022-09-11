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

import igv from '../node_modules/igv/dist/igv.esm.js'
import {GoogleAuth, igvxhr, makeDraggable, BGZip} from '../node_modules/igv-utils/src/index.js'
import {
    AlertSingleton,
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
import {createGenomeWidgets, getGenomesArray, loadGenome} from './genomeUtils.js'
import {createAppBookmarkHandler, createShareWidgets, shareWidgetConfigurator} from './shareWidgets.js'
import {createSVGWidget} from './svgWidget.js'
import GtexUtils from "./gtexUtils.js"
import version from "./version.js"
import {createCircularViewResizeModal} from "./circularViewResizeModal.js"
import JuiceboxPanel from './juicebox/juiceboxPanel.js'
import {configureSessionWidgets} from './session.js'
import {extractQuery} from './utils.js'

document.addEventListener("DOMContentLoaded", async (event) => await main(document.getElementById('igv-app-container'), igvwebConfig))

let dropboxEnabled = false
let googleEnabled = false
let currentGenomeId

async function main(container, config) {

    AlertSingleton.init(container)

    $('#igv-app-version').text(`IGV-Web app version ${version()}`)
    $('#igv-igvjs-version').text(`igv.js version ${igv.version()}`)

    const query = extractQuery()

    if (query.sessionURL) {
        const session = JSON.parse(BGZip.uncompressString(query.sessionURL.substring(5)))
        config.igvConfig = Object.assign( { queryParametersSupported:false }, session.igv)
        config.juiceboxConfig = Object.assign( { queryParametersSupported:false }, (session.juicebox || config.juiceboxConfig))
    }

    if (config.enableCircularView) {
        await initializeCircularView()
    }

    const enableGoogle = (config.clientId || config.apiKey) &&
        (window.location.protocol === "https:" || window.location.host.startsWith("localhost"))

    if (enableGoogle) {

        try {
            await GoogleAuth.init({
                client_id: config.clientId,
                apiKey: config.apiKey,
                scope: 'https://www.googleapis.com/auth/userinfo.profile',
            })
            googleEnabled = true
        } catch (e) {
            const str = `Error initializing Google Drive: ${ e.message || e.details }`
            console.error(str)
            //AlertSingleton.present(str)
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
        config.genomes = await getGenomesArray(config.genomes)
        config.igvConfig.genomes = config.genomes
    }

    const igvConfig = config.igvConfig

    if (config.restoreLastGenome) {
        try {
            const lastGenomeId = localStorage.getItem("genomeID")
            if (lastGenomeId && lastGenomeId !== igvConfig.genome && config.genomes.find(elem => elem.id === lastGenomeId)) {
                igvConfig.genome = lastGenomeId
                igvConfig.tracks = []
            }
        } catch (e) {
            console.error(e)
        }
    }

    const browser = await igv.createBrowser(container, igvConfig)

    if (browser) {
        Globals.browser = browser
        await initializationHelper(browser, container, config)
    }


}

async function initializationHelper(browser, container, options) {

    await createJuiceboxPanel(Object.assign({ browser }, options))

    if (true === options.enableCircularView) {
        createCircularView(browser)
    }

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

    await createGenomeWidgets({
        $igvMain,
        urlModalId: 'igv-app-genome-from-url-modal',
        genomeFileLoad: new GenomeFileLoad(genomeFileLoadConfig),
        browser,
        genomes: options.genomes,
        $dropdownMenu: $('#igv-app-genome-dropdown-menu')
    })

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
        ['igv-app-encode-signals-chip-modal', 'igv-app-encode-signals-other-modal', 'igv-app-encode-others-modal'],
        'igv-app-track-from-url-modal',
        'igv-app-track-select-modal',
        GtexUtils,
        options.trackRegistryFile,
        trackLoader)

    await configureSessionWidgets({ $igvMain, browser, initializeDropbox, options, googleEnabled })

    createSVGWidget({browser, saveModal: document.getElementById('igv-app-svg-save-modal')})

    let shareConfig =
        {
            igvBrowser: browser,
            hicBrowser: browser.juiceboxPanel.browser,
            container
        }

    Object.assign(shareConfig, options)

    if (undefined === options.embedTarget) {
        Object.assign(shareConfig, { embedTarget: `https://igv.org/web/release/${igv.version()}/embed.html` })
    }

    createShareWidgets(shareWidgetConfigurator(shareConfig))

    createAppBookmarkHandler($('#igv-app-bookmark-button'))

    const genomeChangeListener = async event => {

        const {data: genomeID} = event

        if (currentGenomeId !== genomeID) {

            currentGenomeId = genomeID

            await updateTrackMenus(genomeID, undefined, options.trackRegistryFile, $('#igv-app-track-dropdown-menu'))

        }
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

async function initializeCircularView() {

    return new Promise((resolve, reject) => {

        const react = document.createElement('script')
        react.setAttribute('src', 'https://unpkg.com/react@16/umd/react.production.min.js')

        const reactDom = document.createElement('script')
        reactDom.setAttribute('src', 'https://unpkg.com/react-dom@16/umd/react-dom.production.min.js')

        const circView = document.createElement('script')
        circView.setAttribute('src', 'https://unpkg.com/@jbrowse/react-circular-genome-view@1.6.9/dist/react-circular-genome-view.umd.production.min.js')

        react.addEventListener('load', () => {
            document.head.appendChild(reactDom)
        })

        reactDom.addEventListener('load', () => {
            document.head.appendChild(circView)
        })

        circView.addEventListener('load', () => {
            resolve(true)
        })

        document.head.appendChild(react)
    })
}

function createCircularView (browser) {

    const { x:minX, y:minY } = document.querySelector('#igv-main').getBoundingClientRect()

    const circularViewContainer = document.getElementById('igv-circular-view-container')

    browser.createCircularView(circularViewContainer, false)

    makeDraggable(circularViewContainer, browser.circularView.toolbar, { minX, minY } )

    browser.circularView.setSize(512)

    document.getElementById('igv-app-circular-view-nav-item').style.display = 'block'

    const dropdownButton = document.getElementById('igv-app-circular-view-dropdown-button')
    dropdownButton.addEventListener('click', e => {

        document.getElementById('igv-app-circular-view-presentation-button').innerText = browser.circularViewVisible ? 'Hide' : 'Show'

        if (browser.circularViewVisible) {
            document.getElementById('igv-app-circular-view-resize-button').removeAttribute('disabled');
            document.getElementById('igv-app-circular-view-clear-chords-button').removeAttribute('disabled');
        } else {
            document.getElementById('igv-app-circular-view-resize-button').setAttribute('disabled', '');
            document.getElementById('igv-app-circular-view-clear-chords-button').setAttribute('disabled', '');
        }


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

async function createJuiceboxPanel(config) {

    let juiceboxPanelConfig =
        {
            igvBrowser: config.browser,
            panel: document.querySelector('#spacewalk_juicebox_panel'),
            queryParametersSupported: false,
            offDiagonalBinThresholdInput: document.querySelector('#igv-juicebox-off-diagonal-bin-threshold'),
            percentileThresholdInput: document.querySelector('#igv-juicebox-percentile-threshold'),
            alphaModifierInput: document.querySelector('#igv-juicebox-alpha-modifier'),
            updateContactsButton: document.querySelector('#igv-juicebox-update-contacts-button'),
        };

    Object.assign(juiceboxPanelConfig,config.juiceboxConfig)

    config.browser.juiceboxPanel = new JuiceboxPanel(juiceboxPanelConfig)
    await config.browser.juiceboxPanel.initialize()



    const juiceboxPresentationButton = document.querySelector('#juicebox-panel-present-button')

    juiceboxPresentationButton.addEventListener('click', e => config.browser.juiceboxPanel.toggle())

    EventBus.globalBus.subscribe("DidPresentJuiceboxPanel", () => juiceboxPresentationButton.innerText = 'Hide')
    EventBus.globalBus.subscribe("DidDismissJuiceboxPanel", () => juiceboxPresentationButton.innerText = 'Show')

}

async function loadIGVTrack(hicBrowser, igvBrowser) {

    if (hicBrowser.genome.id !== igvBrowser.genome.id) {

        const config = igvBrowser.juiceboxPanel.createIGVConfiguration(hicBrowser, igvBrowser, hicBrowser.genome.id, 'session')
        await igvBrowser.loadSession(config)
    } else {
        const list = igvBrowser.findTracks('id', 'jb-interactions')
        if (0 === list.length) {

            const trackConfiguration = igvBrowser.juiceboxPanel.createIGVConfiguration(hicBrowser, igvBrowser, igvBrowser.genome.id, 'track')
            await igvBrowser.loadTrack(trackConfiguration)
        }
    }
}

export {main, loadIGVTrack}
