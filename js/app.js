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

import {FileUtils, DOMUtils, makeDraggable, GoogleAuth, igvxhr} from '../node_modules/igv-utils/src/index.js';
import { AlertSingleton, GenomeFileLoad, createSessionWidgets, createTrackWidgetsWithTrackRegistry, updateTrackMenus, dropboxButtonImageBase64, dropboxDropdownItem, EventBus, googleDriveButtonImageBase64, googleDriveDropdownItem } from '../node_modules/igv-widgets/dist/igv-widgets.js'
import Globals from "./globals.js"
import {creatGenomeWidgets, loadGenome, initializeGenomeWidgets} from './genomeWidgets.js';
import {createShareWidgets, shareWidgetConfigurator} from './shareWidgets.js';
import {sessionURL} from './shareHelper.js';
import {createSVGWidget} from './svgWidget.js';
import GtexUtils from "./gtexUtils.js";
import version from "./version.js";
import {createCircularViewResizeModal} from "./circularViewResizeModal.js";

$(document).ready(async () => main(document.getElementById('igv-app-container'), igvwebConfig));

let googleEnabled = false;
let currentGenomeId
let circularView

async function main(container, config) {

    AlertSingleton.init(container)

    $('#igv-app-version').text(`IGV-Web app version ${version()}`)
    $('#igv-igvjs-version').text(`igv.js version ${igv.version()}`)

    const enableGoogle = (config.clientId  || config.apiKey) &&
        (window.location.protocol === "https:" || window.location.host === "localhost");

    if (enableGoogle) {
        try {
            await GoogleAuth.init({
                client_id: config.clientId,
                apiKey: config.apiKey,
                scope: 'https://www.googleapis.com/auth/userinfo.profile',
            })
            //await GoogleAuth.signOut();   // The await is important !!!
            googleEnabled = true;
        } catch (e) {
            console.error(e);
            AlertSingleton.present(e.message)
        }
    }

    // Load genomes for use by igv.js and webapp
    if (config.genomes) {
        let tmp = await getGenomesArray(config.genomes);
        config.genomes = tmp;
        config.igvConfig.genomes = tmp;
    }

    const igvConfig = config.igvConfig;

    // JBrowse CircularView hack
    igvConfig.tracks[ 0 ].onclick = (features, e) => {
        if (e.shiftKey) {
            if (features) {
                sendPairedAlignmentChord(features)
            }
            return true;
        } else {
            return false;
        }
    }

    if(config.restoreLastGenome) {
        const lastGenomeId = localStorage.getItem("genomeID");
        if (lastGenomeId && lastGenomeId !== igvConfig.genome) {
            igvConfig.genome = lastGenomeId;
            igvConfig.tracks = [];
        }
    }


    const browser = await igv.createBrowser(container, igvConfig);

    if (browser) {
        Globals.browser = browser;
        await initializationHelper(browser, container, config);
    }
}

async function initializationHelper(browser, container, options) {

    ['track', 'genome'].forEach(str => {
        let imgElement;

        imgElement = document.querySelector(`img#igv-app-${str}-dropbox-button-image`);
        imgElement.src = `data:image/svg+xml;base64,${dropboxButtonImageBase64()}`;

        imgElement = document.querySelector(`img#igv-app-${str}-google-drive-button-image`);
        imgElement.src = `data:image/svg+xml;base64,${googleDriveButtonImageBase64()}`;
    })

    // Session - Dropbox and Google Drive buttons
    $('div#igv-session-dropdown-menu > :nth-child(1)').after(dropboxDropdownItem('igv-app-dropdown-dropbox-session-file-button'));
    $('div#igv-session-dropdown-menu > :nth-child(2)').after(googleDriveDropdownItem('igv-app-dropdown-google-drive-session-file-button'));

    const $igvMain = $('#igv-main')

    const genomeFileLoadConfig =
        {
            localFileInput: document.getElementById('igv-app-dropdown-local-genome-file-input'),
            dropboxButton: document.getElementById('igv-app-dropdown-dropbox-genome-file-button'),
            googleEnabled,
            googleDriveButton: document.getElementById('igv-app-dropdown-google-drive-genome-file-button'),
            loadHandler: async configuration => {

                if (configuration.id !== browser.genome.id) {
                    await loadGenome(configuration)
                }

            },
            igvxhr
        };

    creatGenomeWidgets({ $igvMain, urlModalId: 'igv-app-genome-from-url-modal', genomeFileLoad: new GenomeFileLoad(genomeFileLoadConfig)})

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
        $('#igv-app-dropdown-dropbox-track-file-button'),
        googleEnabled,
        $('#igv-app-dropdown-google-drive-track-file-button'),
        ['igv-app-encode-signal-modal', 'igv-app-encode-others-modal'],
        'igv-app-track-from-url-modal',
        'igv-app-track-select-modal',
        GtexUtils,
        options.trackRegistryFile,
        trackLoader);

    const sessionSaver = () => {
        try {
            return browser.toJSON();
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
        'igv-app-dropdown-dropbox-session-file-button',
        'igv-app-dropdown-google-drive-session-file-button',
        'igv-app-session-url-modal',
        'igv-app-session-save-modal',
        googleEnabled,
        sessionLoader,
        sessionSaver);

    createSVGWidget({ browser, saveModal: document.getElementById('igv-app-svg-save-modal')})

    createShareWidgets(shareWidgetConfigurator(browser, container, options));

    createAppBookmarkHandler($('#igv-app-bookmark-button'));

    const genomeChangeListener = async event => {

        const { data:genomeID } = event;

        if (currentGenomeId !== genomeID) {

            currentGenomeId = genomeID;

            await updateTrackMenus(genomeID, undefined, options.trackRegistryFile, $('#igv-app-track-dropdown-menu'))

            await updateSessionMenu(genomeID, 'igv-session-list-divider', options.sessionRegistryFile, sessionLoader)
        }
    }

    if (true === circularViewIsInstalled()) {

        const circularViewContainer = document.getElementById('igv-circular-view-container')
        makeDraggable(circularViewContainer, circularViewContainer)
        browser.createCircularView(circularViewContainer, false);

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

        document.getElementById('igv-main').appendChild(createCircularViewResizeModal('igv-app-circular-view-resize-modal', 'Resize Circular View'));

        document.getElementById('igv-app-circular-view-resize-modal-input').addEventListener('keyup', (event) => {
            event.preventDefault()
            event.stopPropagation()
            if (13 === event.keyCode) {
                const str = event.target.value;
                circularViewContainer.style.width = `${ str }px`;
                circularViewContainer.style.height = `${ str }px`;
                browser.circularView.setSize(Number.parseInt(str));

            }
        })

        $('#igv-app-circular-view-resize-modal').on('shown.bs.modal', () => document.getElementById('igv-app-circular-view-resize-modal-input').value = circularViewContainer.clientWidth.toString())

        // document.getElementById('igv-app-circular-view-resize-modal-cancel').addEventListener('click', () => {
        //     $('#igv-app-circular-view-resize-modal').modal('hide')
        // })
        //
        // document.getElementById('igv-app-circular-view-resize-modal-ok').addEventListener('click', () => {
        //     $('#igv-app-circular-view-resize-modal').modal('hide')
        // })

    }


    EventBus.globalBus.subscribe("DidChangeGenome", genomeChangeListener)

    EventBus.globalBus.post({type: "DidChangeGenome", data: browser.genome.id});
}

async function updateSessionMenu(genomeID, sessionListDivider, sessionRegistryFile, sessionLoader) {

    let response = undefined;
    try {
        response = await fetch(sessionRegistryFile);
    } catch (e) {
        console.error(e);
    }

    let sessionRegistry = undefined
    if (response) {
        sessionRegistry = await response.json();
    } else {
        const e = new Error("Error retrieving session registry");
        AlertSingleton.present(e.message);
        throw e;
    }

    const id_prefix = 'genome_specific_session_file'

    const searchString = `[id^=${ id_prefix }]`
    const elements = document.querySelectorAll(searchString)
    if (elements.length > 0) {
        for (let i = 0; i < elements.length; i++) {
            elements[ i ].remove()
        }
    }

    const sessions = sessionRegistry[ genomeID ]
    if (sessions) {

        for (let { name, url } of sessionRegistry[ genomeID ]) {

            const referenceNode = document.getElementById(sessionListDivider)

            const button_id = `${ id_prefix }_${ DOMUtils.guid() }`
            const html = `<button id="${ button_id }" class="dropdown-item" type="button">${ name }</button>`
            const fragment = document.createRange().createContextualFragment(html)

            referenceNode.after(fragment.firstChild)

            const button = document.getElementById(button_id)
            button.addEventListener('click', () => {

                const config = {};
                const key = true === FileUtils.isFilePath(url) ? 'file' : 'url';
                config[ key ] = url;

                sessionLoader(config);

            })
        }

    }

}

function sendPairedAlignmentChord(features) {
    circularView.selectAlignmentChord(features[0]);
}

function sendBedPEChords(features) {
    circularView.addBedPEChords(features);
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
            window.history.pushState({}, "IGV", url);

            const str = (/Mac/i.test(navigator.userAgent) ? 'Cmd' : 'Ctrl');
            const blurb = 'A bookmark URL has been created. Press ' + str + '+D to save.';
            alert(blurb);
        }
    })
}

async function getGenomesArray(genomes) {

    if (undefined === genomes) {
        return undefined;
    }
    if (Array.isArray(genomes)) {
        return genomes;
    } else {

        let response = undefined;
        try {
            response = await fetch(genomes);
            return response.json();
        } catch (e) {
            AlertSingleton.present(e.message);
        }
    }
}

function circularViewIsInstalled() {
    return window["JBrowseReactCircularGenomeView"] !== undefined && window["React"] !== undefined && window["ReactDOM"] !== undefined;
}

export {main}
