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
import * as GoogleAuth from '../node_modules/igv-utils/src/google-utils/googleAuth.js'
import makeDraggable from "./widgets/utils/draggable.js"
import alertSingleton from "./widgets/alertSingleton.js"
import {createSessionWidgets} from "./widgets/sessionWidgets.js"
import {
    createTrackWidgets,
    trackMenuGenomeChange
} from "./widgets/trackWidgets.js"
import {
    dropboxButtonImageBase64,
    dropboxDropdownItem,
    googleDriveButtonImageBase64,
    googleDriveDropdownItem
} from "./widgets/markupFactory.js"
import Globals from "./globals.js"
import {createGenomeWidgets} from './widgets/genomeWidgets.js'
import {createShareWidgets} from './shareWidgets.js'
import {sessionURL} from './shareHelper.js'
import {createSaveImageWidgets} from './widgets/saveImageWidgets.js'
import version from "./version.js"
import {createCircularViewResizeModal} from "./circularViewResizeModal.js"
import {igvxhr} from '../node_modules/igv-utils/src/index.js'
import NotificationDialog from "./widgets/notificationDialog.js"
import {createToolsWidgets} from "./widgets/toolsWidgets.js"
import {createSampleInfoWidgets} from "./widgets/sampleInfoWidgets.js"


document.addEventListener("DOMContentLoaded", async (event) => await main(document.getElementById('igv-app-container'), igvwebConfig))

let isDropboxEnabled = false

let isGoogleEnabled
let isGoogleDriveEnabled

let currentGenomeId
const googleWarningFlag = "googleWarningShown"

let svgSaveImageModal
let pngSaveImageModal

let notificationDialog

async function main(container, config) {

    alertSingleton.init(document.getElementById('igv-main'))

    document.getElementById('igv-app-version').textContent = `IGV-Web app version ${version()}`
    document.getElementById('igv-igvjs-version').textContent = `igv.js version ${igv.version()}`

    if (config.notifications) {
        setupNotifications(config.notifications)
    }

    isDropboxEnabled = undefined !== config.dropboxAPIKey
    isGoogleEnabled = undefined !== config.clientId
    isGoogleDriveEnabled = config.googleDriveEnabled === true

    configureCloudButtons(config)

    // Configure Google oAuth
    if (isGoogleEnabled) {
        checkGoogleConfig(config)
        try {
            await GoogleAuth.init({
                client_id: config.clientId,
                apiKey: config.apiKey,
                appId: config.appId,
                scope: 'https://www.googleapis.com/auth/userinfo.profile',
            })

        } catch (e) {
            const str = `Error Google oAuth: ${e.message || e.details}`
            alertSingleton.present(str)
            console.error(str)
        }
    }

    // If a proxy is defined for CORS errors, set it here.  Currently igv and igv-webapp maintain separate instances
    // of igvxhr, set it in both places.   TODO -- unify igvxhr instances
    if (config.corsProxy) {
        igvxhr.corsProxy = config.corsProxy
        igv.setCORSProxy(config.corsProxy)
    }

    // Load pre-defined genomes for use by igv.js and webapp
    if (config.genomes) {
        config.genomes = await getGenomesArray(config.genomes)
        config.igvConfig.genomes = config.genomes
        config.igvConfig.loadDefaultGenomes = false
    }

    // Recently accessed genomes, which might include custom genomes loaded by URL
    let recentGenomes
    const recentGenomesString = localStorage.getItem("recentGenomes")
    if (recentGenomesString) {
        recentGenomes = JSON.parse(recentGenomesString)
    }


    // Initialize igv.js, creating the Browser instance
    let browser

    // Optionally change the igv genome to the last genome used.
    const igvConfig = config.igvConfig
    const igvConfigGenome = igvConfig.genome   // the genome specified in the configuration file
    if (config.restoreLastGenome) {
        try {
            const lastGenomeId = localStorage.getItem("genomeID")
            if (lastGenomeId && lastGenomeId !== igvConfigGenome) {
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
    try {
        browser = await igv.createBrowser(container, igvConfig)

    } catch (e) {
        // Try configured genome
        if (igvConfigGenome !== igvConfig.genome) {
            igvConfig.genome = igvConfigGenome
            if (browser) {
                igv.removeBrowser(browser)
            }
            browser = await igv.createBrowser(container, igvConfig)
        } else {
            console.error(e)
            alertSingleton.present(e)
            return
        }
    }
    Globals.browser = browser

    const igvMain = document.getElementById('igv-main')

    // Genome widgets
    await createGenomeWidgets(igvMain, browser, config.genomes)


    // Sample info
    createSampleInfoWidgets(igvMain, browser)

    // Sessions
    await createSessionWidgets(igvMain, browser, config)

    // Tools
    createToolsWidgets(igvMain, browser, config)

    // Image save
    createSaveImageWidgets(browser)

    // Share
    createShareWidgets(container, browser, config)


    // Tracks
    await createTrackWidgets(igvMain, browser, config)

    browser.on("genomechange", async ({genome, trackConfigurations}) => {
        if (currentGenomeId !== genome.id) {
            currentGenomeId = genome.id
            await trackMenuGenomeChange(browser, genome)
        }
    })
    // Manually fire the genome change event to initialize the track menu.
    await trackMenuGenomeChange(browser, browser.genome)


    createAppBookmarkHandler($('#igv-app-bookmark-button'))

    if (true === config.enableCircularView) {

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

        document.getElementById('igv-app-circular-view-resize-modal').addEventListener('shown.bs.modal', () => {
            document.getElementById('igv-app-circular-view-resize-modal-input').value = circularViewContainer.clientWidth.toString()
        })
    }

}


function configureCloudButtons() {

    ['track', 'genome', 'sample-info'].forEach(str => {
        let imgElement

        if (isDropboxEnabled) {
            imgElement = document.querySelector(`img#igv-app-${str}-dropbox-button-image`)
            imgElement.src = `data:image/svg+xml;base64,${dropboxButtonImageBase64()}`
        } else {
            imgElement = document.getElementById(`igv-app-dropdown-dropbox-${str}-file-button`)
            imgElement.parentElement.style.display = 'none'
        }

        if (isGoogleDriveEnabled) {
            imgElement = document.querySelector(`img#igv-app-${str}-google-drive-button-image`)
            imgElement.src = `data:image/svg+xml;base64,${googleDriveButtonImageBase64()}`
        } else {
            imgElement = document.getElementById(`igv-app-dropdown-google-drive-${str}-file-button`)
            imgElement.parentElement.style.display = 'none'
        }
    })

    if (isDropboxEnabled) {
        const sessionDropdownMenu = document.querySelector('div#igv-session-dropdown-menu')
        const firstChild = sessionDropdownMenu.children[0]
        firstChild.insertAdjacentHTML('afterend', dropboxDropdownItem('igv-app-dropdown-dropbox-session-file-button'))
    }

    if (isGoogleDriveEnabled) {
        document.querySelector('div#igv-session-dropdown-menu > :nth-child(2)')
            .insertAdjacentHTML('afterend', googleDriveDropdownItem('igv-app-dropdown-google-drive-session-file-button'))
    }

    // Google sign in NOT google drive
    if (isGoogleEnabled) {
        configureGoogleSignInButton()
    }
}


let notificationDialogs

function setupNotifications(notificatons) {

    if (notificatons && notificatons.length > 0) {

        notificationDialogs = notificatons.map(notification => {

            const [key, value] = Object.entries(notification).flat()
            notificationDialog = new NotificationDialog(document.body, key)

            const status = "true" === localStorage.getItem(`note_${key}`)
            if (!status) {
                notificationDialog.present(value)
            }

        })
    }

}

function configureGoogleSignInButton() {

    if (true === isGoogleEnabled) {

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

function checkGoogleConfig(config) {
    if (config.apiKey && config.apiKey.startsWith("leawkk")) {
        config.apiKey = atob(config.apiKey.substring(6))
    }
    if (config.clientId && config.clientId.startsWith("Z_%%12")) {
        config.clientId = atob(config.clientId.substring(6))
    }
}

function createAppBookmarkHandler($bookmark_button) {

    $bookmark_button.on('click', (e) => {

        let url = undefined
        try {
            url = sessionURL()
        } catch (e) {
            alertSingleton.present(e.message)
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

        try {
            return igvxhr.loadJson(genomes)
        } catch (e) {
            alertSingleton.present(e.message)
        }
    }
}


export {main}
