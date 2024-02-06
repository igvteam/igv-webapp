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

import igv from '../node_modules/igv/js/index.js'
import * as GoogleAuth from '../node_modules/google-utils/src/googleAuth.js'
import * as GooglePicker from '../node_modules/google-utils/src/googleFilePicker.js'
import {makeDraggable} from "./draggable.js"
import {
    AlertSingleton,
    createSessionWidgets,
    createTrackWidgetsWithTrackRegistry,
    dropboxButtonImageBase64,
    dropboxDropdownItem,
    GenomeFileLoad,
    googleDriveButtonImageBase64,
    googleDriveDropdownItem,
    getPathsWithTrackRegistryFile,
    updateTrackMenusWithTrackConfigurations,
    FileLoadManager,
    FileLoadWidget,
    Utils
} from '../node_modules/igv-widgets/dist/igv-widgets.js'
import Globals from "./globals.js"
import {createGenomeWidgets, initializeGenomeWidgets, loadGenome} from './genomeWidgets.js'
import {createShareWidgets, shareWidgetConfigurator} from './shareWidgets.js'
import {sessionURL} from './shareHelper.js'
import {createSaveImageWidget} from './saveImageWidget.js'
import GtexUtils from "./gtexUtils.js"
import version from "./version.js"
import {createCircularViewResizeModal} from "./circularViewResizeModal.js"

document.addEventListener("DOMContentLoaded", async (event) => await main(document.getElementById('igv-app-container'), igvwebConfig))

let isDropboxEnabled = false
let googleEnabled = false
let currentGenomeId
const googleWarningFlag = "googleWarningShown"

async function main(container, config) {

    AlertSingleton.init(container)

    $('#igv-app-version').text(`IGV-Web app version ${version()}`)
    $('#igv-igvjs-version').text(`igv.js version ${igv.version()}`)

    const doEnableGoogle = undefined !== config.clientId

    if (doEnableGoogle) {

        try {
            await GoogleAuth.init({
                client_id: config.clientId,
                apiKey: config.apiKey,
                scope: 'https://www.googleapis.com/auth/userinfo.profile',
            })
            googleEnabled = true

            // Reset google warning flag on success
            localStorage.removeItem(googleWarningFlag)

        } catch (e) {
            const str = `Error initializing Google Drive: ${e.message || e.details}`
            console.error(str)
            const googleWarning = "true" === localStorage.getItem(googleWarningFlag)
            //AlertSingleton.present(str)
            if (!googleWarning) {
                localStorage.setItem(googleWarningFlag, "true")
                alert(str)
            }
        }
    }

    // Load genomes for use by igv.js and webapp
    if (config.genomes) {
        config.genomes = await getGenomesArray(config.genomes)
        config.igvConfig.genomes = config.genomes
    }

    // Custom (user loaded) genomes
    let recentGenomes
    const customGenomeString = localStorage.getItem("recentGenomes")
    if (customGenomeString) {
        recentGenomes = JSON.parse(customGenomeString)
    }

    const igvConfig = config.igvConfig
    const igvConfigGenome = igvConfig.genome   // the genome specified in the configuration file
    if (config.restoreLastGenome) {
        try {
            const lastGenomeId = localStorage.getItem("genomeID")
            if (lastGenomeId && lastGenomeId !== igvConfig.genome) {
                if (config.genomes && config.genomes.find(elem => elem.id === lastGenomeId) ||
                    (recentGenomes && recentGenomes.find(elem => elem.id === lastGenomeId)) ||
                    ((lastGenomeId.startsWith("GCA_") || lastGenomeId.startsWith("GCF_")) && lastGenomeId.length >= 13)) {
                    igvConfig.genome = lastGenomeId
                    igvConfig.tracks = []
                }
            }
        } catch (e) {
            console.error(e)
        }
    }

    const trackLoader = async configurations => {
        try {
            await browser.loadTrackList(configurations)
        } catch (e) {
            console.error(e)
            AlertSingleton.present(e)
        }
    }

    const trackMenuHandler = urlList => {

        const urlSet = browser.getTrackURLs()

        for (const {element, url} of urlList) {
            if (urlSet.has(url)) {
                element.setAttribute('disabled', true)
            } else {
                element.removeAttribute('disabled')
            }
        }

    }

    const $igvMain = $('#igv-main')
    createTrackWidgetsWithTrackRegistry($igvMain,
        $('#igv-app-track-dropdown-menu'),
        $('#igv-app-dropdown-local-track-file-input'),
        initializeDropbox,
        config.dropboxAPIKey ? $('#igv-app-dropdown-dropbox-track-file-button') : undefined,
        googleEnabled,
        $('#igv-app-dropdown-google-drive-track-file-button'),
        ['igv-app-encode-signals-chip-modal', 'igv-app-encode-signals-other-modal', 'igv-app-encode-others-modal'],
        'igv-app-track-from-url-modal',
        'igv-app-track-select-modal',
        GtexUtils,
        config.trackRegistryFile,
        trackLoader,
        trackMenuHandler)

    igvConfig.listeners = {

        'genomechange': async ({genome, trackConfigurations}) => {

            if (currentGenomeId !== genome.id) {

                currentGenomeId = genome.id

                let configs = await getPathsWithTrackRegistryFile(genome.id, config.trackRegistryFile)

                if (undefined === configs) {
                    configs = trackConfigurations
                }

                if (configs) {
                    await updateTrackMenusWithTrackConfigurations(genome.id, undefined, configs, $('#igv-app-track-dropdown-menu'))
                }

            }
        }
    }

    // TODO -- fix this hack.  We are assuming th error is due to the "last genome loaded, it could be anything.
    let browser
    try {
        browser = await igv.createBrowser(container, igvConfig)
    } catch (e) {
        if (igvConfigGenome !== igvConfig.genome) {
            igv.removeAllBrowsers()
            igvConfig.genome = igvConfigGenome
            browser = await igv.createBrowser(container, igvConfig)
        } else {
            console.error(e)
        }
    }

    if (browser) {
        Globals.browser = browser
        await initializationHelper(browser, container, config)
    }
}

async function initializationHelper(browser, container, options) {

    ['track', 'genome', 'sample-info'].forEach(str => {
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

    configureGoogleSignInButton()

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
            googleEnabled: googleEnabled,
            googleDriveButton: document.getElementById('igv-app-dropdown-google-drive-genome-file-button'),
            loadHandler: async configuration => {

                if (configuration.id !== browser.genome.id) {
                    await loadGenome(configuration)
                }

            }

        }

    // Create widgets for URL and File loads.
    createGenomeWidgets({
        $igvMain,
        urlModalId: 'igv-app-genome-from-url-modal',
        genomeFileLoad: new GenomeFileLoad(genomeFileLoadConfig)
    })

    await initializeGenomeWidgets(options.genomes)

    const trackLoader = async configurations => {
        try {
            // Add "searchable" attribute to non-indexed annotation tracks
            for (let c of configurations) {


            }
            await browser.loadTrackList(configurations)
        } catch (e) {
            console.error(e)
            AlertSingleton.present(e)
        }
    }

    createSampleInfoMenu(document.getElementById('igv-main'),
        document.getElementById('igv-app-sample-info-dropdown-local-track-file-input'),
        initializeDropbox,
        options.dropboxAPIKey ? document.getElementById('igv-app-dropdown-dropbox-sample-info-file-button') : undefined,
        googleEnabled,
        document.getElementById('igv-app-dropdown-google-drive-sample-info-file-button'),
        'igv-app-sample-info-from-url-modal',
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

    if (options.sessionRegistryFile) {
        await createSessionMenu('igv-session-list-divider', options.sessionRegistryFile, sessionLoader)
    } else {
        document.querySelector('#igv-session-list-divider').style.display = 'none'
    }

    createSaveImageWidget({browser, saveModal: document.getElementById('igv-app-svg-save-modal'), imageType: 'svg'})

    createSaveImageWidget({browser, saveModal: document.getElementById('igv-app-png-save-modal'), imageType: 'png'})

    createShareWidgets(shareWidgetConfigurator(browser, container, options))

    createAppBookmarkHandler($('#igv-app-bookmark-button'))

    if (true === options.enableCircularView) {

        const {x: minX, y: minY} = document.querySelector('#igv-main').getBoundingClientRect()

        const circularViewContainer = document.getElementById('igv-circular-view-container')

        browser.createCircularView(circularViewContainer, false)

        makeDraggable(circularViewContainer, browser.circularView.toolbar, {minX, minY})

        browser.circularView.setSize(512)

        document.getElementById('igv-app-circular-view-nav-item').style.display = 'block'

        const dropdownButton = document.getElementById('igv-app-circular-view-dropdown-button')
        dropdownButton.addEventListener('click', e => {

            document.getElementById('igv-app-circular-view-presentation-button').innerText = browser.circularViewVisible ? 'Hide' : 'Show'

            if (browser.circularViewVisible) {
                document.getElementById('igv-app-circular-view-resize-button').removeAttribute('disabled')
                document.getElementById('igv-app-circular-view-clear-chords-button').removeAttribute('disabled')
            } else {
                document.getElementById('igv-app-circular-view-resize-button').setAttribute('disabled', '')
                document.getElementById('igv-app-circular-view-clear-chords-button').setAttribute('disabled', '')
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

}

function createSampleInfoMenu(igvMain,
                              localFileInput,
                              initializeDropbox,
                              dropboxButton,
                              googleEnabled,
                              googleDriveButton,
                              urlModalId,
                              trackLoadHandler) {

    // local file
    localFileInput.addEventListener('change', async () => {

        const {files} = localFileInput

        const paths = Array.from(files)

        localFileInput.value = ''

        await trackLoadHandler([{type: 'sampleinfo', url: paths[0]}])
    })

    //  Dropbox
    if (dropboxButton) dropboxButton.addEventListener('click', async () => {

        const result = await initializeDropbox()

        if (true === result) {

            const obj =
                {
                    success: dbFiles => {

                        const configList = dbFiles.map(({link}) => {
                            return {type: 'sampleinfo', url: link}
                        })

                        trackLoadHandler(configList)
                    },
                    cancel: () => {
                    },
                    linkType: "preview",
                    multiselect: false,
                    folderselect: false,
                }

            Dropbox.choose(obj)

        } else {
            AlertSingleton.present('Cannot connect to Dropbox')
        }
    })

    // Google Drive
    if (!googleEnabled) {
        googleDriveButton.parentElement.style.display = 'none'
    } else {

        googleDriveButton.addEventListener('click', () => {

            const filePickerHandler = async responses => {
                const paths = responses.map(({url}) => url)
                await trackLoadHandler([{type: 'sampleinfo', url: paths[0]}])
            }

            GooglePicker.createDropdownButtonPicker(false, filePickerHandler)
        })

    }

    // URL
    const html =
        `<div id="${urlModalId}" class="modal">

            <div class="modal-dialog modal-lg">
    
                <div class="modal-content">
    
                    <div class="modal-header">
                        <div class="modal-title">Sample Info URL</div>
    
                        <button type="button" class="close" data-dismiss="modal">
                            <span>&times;</span>
                        </button>
    
                    </div>
    
                    <div class="modal-body">
                    </div>
    
                    <div class="modal-footer">
                        <button type="button" class="btn btn-sm btn-outline-secondary" data-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-sm btn-secondary" data-dismiss="modal">OK</button>
                    </div>
    
                </div>
    
            </div>

        </div>`

    const fragment = document.createRange().createContextualFragment(html)

    const urlModal = fragment.firstChild

    igvMain.appendChild(urlModal)

    const fileLoadWidgetConfig =
        {
            widgetParent: urlModal.querySelector('.modal-body'),
            dataTitle: 'Sample Info',
            indexTitle: 'Index',
            mode: 'url',
            fileLoadManager: new FileLoadManager(),
            dataOnly: false,
            doURL: true
        }

    const fileLoadWidget = new FileLoadWidget(fileLoadWidgetConfig)

    Utils.configureModal(fileLoadWidget, urlModal, async fileLoadWidget => {
        const paths = fileLoadWidget.retrievePaths()
        await trackLoadHandler([{type: 'sampleinfo', url: paths[0]}])
        return true
    })

}

function configureGoogleSignInButton() {

    if (true === googleEnabled) {

        const dropdownToggle = document.querySelector('#igv-google-drive-dropdown-toggle')
        dropdownToggle.style.display = 'block'

        const signInOutButton = document.querySelector('#igv-google-drive-sign-out-button')

        let currentUserProfile = undefined

        $('#igv-google-drive-dropdown').on('show.bs.dropdown', async () => {

            currentUserProfile = await GoogleAuth.getCurrentUserProfile()

            if (currentUserProfile) {
                const name = currentUserProfile.email || currentUserProfile.name || ''
                signInOutButton.innerText = `Sign Out ${name}`
            } else {
                signInOutButton.innerText = 'Sign In'
            }

        })

        signInOutButton.addEventListener('click', async () => {

            if (currentUserProfile) {
                await GoogleAuth.signOut()
            } else {
                await GoogleAuth.signIn()
            }

        })

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

            const button_id = `${id_prefix}_${guid()}`
            const html = `<button id="${button_id}" class="dropdown-item" type="button">${name}</button>`
            const fragment = document.createRange().createContextualFragment(html)

            referenceNode.after(fragment.firstChild)

            const button = document.getElementById(button_id)
            button.addEventListener('click', () => {

                const config = {}
                const key = true === isFile(url) ? 'file' : 'url'
                config[key] = url

                sessionLoader(config)

            })
        }

    }

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

    if (true === didCompleteOneAttempt && false === isDropboxEnabled) {
        return Promise.resolve(false)
    } else if (true === isDropboxEnabled) {
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
                isDropboxEnabled = true
                resolve(true)
            })

        })
    }
}

function guid() {
    return ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4)
}

function isFile(object) {
    if (!object) {
        return false
    }
    return typeof object !== 'function' &&
        (object instanceof File ||
            (object.hasOwnProperty("name") && typeof object.slice === 'function' && typeof object.arrayBuffer === 'function'))
}


export {main}
