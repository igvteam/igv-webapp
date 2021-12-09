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

import {GoogleAuth, igvxhr} from '../node_modules/igv-utils/src/index.js';
import { AlertSingleton, GenomeFileLoad, createSessionWidgets, createTrackWidgetsWithTrackRegistry, updateTrackMenus, dropboxButtonImageBase64, dropboxDropdownItem, EventBus, googleDriveButtonImageBase64, googleDriveDropdownItem } from '../node_modules/igv-widgets/dist/igv-widgets.js'
import Globals from "./globals.js"
import {createGenomeWidgets, loadGenome, initializeGenomeWidgets} from './genomeWidgets.js';
import {createShareWidgets, shareWidgetConfigurator} from './shareWidgets.js';
import {sessionURL} from './shareHelper.js';
import {createSVGWidget} from './svgWidget.js';
import GtexUtils from "./gtexUtils.js";
import version from "./version.js";

$(document).ready(async () => main(document.getElementById('igv-app-container'), igvwebConfig));

let dropboxEnabled = false;
let googleEnabled = false;
let currentGenomeId

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

async function initializationHelper(browser, container, config) {

    if (true === googleEnabled) {
        document.querySelector('#igv-google-drive-dropdown-toggle').style.display = 'block'

        $('#igv-google-drive-dropdown').on('show.bs.dropdown', () => {
            const user = gapi.auth2.getAuthInstance().currentUser.get()
            document.querySelector('#igv-google-drive-sign-out-button').style.display = user.isSignedIn() ? 'block' : 'none'
        })

        document.querySelector('#igv-google-drive-sign-out-button').addEventListener('click', () => {
            GoogleAuth.signOut()
        })

    }

    ['track', 'genome'].forEach(str => {
        let imgElement;

        imgElement = document.querySelector(`img#igv-app-${str}-dropbox-button-image`);
        if (config.dropboxAPIKey) {
            imgElement.src = `data:image/svg+xml;base64,${dropboxButtonImageBase64()}`;
        } else {
            imgElement = document.querySelector(`#igv-app-dropdown-dropbox-${str}-file-button`);
            imgElement.parentElement.style.display = 'none';
        }

        imgElement = document.querySelector(`img#igv-app-${str}-google-drive-button-image`);
        imgElement.src = `data:image/svg+xml;base64,${googleDriveButtonImageBase64()}`;
    })

    if (config.dropboxAPIKey) {
        $('div#igv-session-dropdown-menu > :nth-child(1)').after(dropboxDropdownItem('igv-app-dropdown-dropbox-session-file-button'));
    }

    $('div#igv-session-dropdown-menu > :nth-child(2)').after(googleDriveDropdownItem('igv-app-dropdown-google-drive-session-file-button'));

    const $igvMain = $('#igv-main')

    const genomeFileLoadConfig =
        {
            localFileInput: document.getElementById('igv-app-dropdown-local-genome-file-input'),
            initializeDropbox,
            dropboxButton: config.dropboxAPIKey ? document.getElementById('igv-app-dropdown-dropbox-genome-file-button') : undefined,
            googleEnabled,
            googleDriveButton: document.getElementById('igv-app-dropdown-google-drive-genome-file-button'),
            loadHandler: async configuration => {

                if (configuration.id !== browser.genome.id) {
                    await loadGenome(configuration)
                }

            },
            igvxhr
        };

    createGenomeWidgets({
        $igvMain,
        urlModalId: 'igv-app-genome-from-url-modal',
        genomeFileLoad: new GenomeFileLoad(genomeFileLoadConfig)
    })

    await initializeGenomeWidgets(browser, config.genomes, $('#igv-app-genome-dropdown-menu'))

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
        config.dropboxAPIKey ? $('#igv-app-dropdown-dropbox-track-file-button') : undefined,
        googleEnabled,
        $('#igv-app-dropdown-google-drive-track-file-button'),
        ['igv-app-encode-signal-modal', 'igv-app-encode-others-modal'],
        'igv-app-track-from-url-modal',
        'igv-app-track-select-modal',
        GtexUtils,
        config.trackRegistryFile,
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
        initializeDropbox,
        config.dropboxAPIKey ? 'igv-app-dropdown-dropbox-session-file-button' : undefined,
        'igv-app-dropdown-google-drive-session-file-button',
        'igv-app-session-url-modal',
        'igv-app-session-save-modal',
        googleEnabled,
        sessionLoader,
        sessionSaver);

    createSVGWidget({ browser, saveModal: document.getElementById('igv-app-svg-save-modal')})

    createShareWidgets(shareWidgetConfigurator(browser, container, config));

    createAppBookmarkHandler($('#igv-app-bookmark-button'));

    const genomeChangeListener = event => {

        const { data:genomeID } = event;

        if (currentGenomeId !== genomeID) {

            currentGenomeId = genomeID;

            updateTrackMenus(genomeID, undefined, config.trackRegistryFile, $('#igv-app-track-dropdown-menu'))

        }
    }

    EventBus.globalBus.subscribe("DidChangeGenome", genomeChangeListener)

    EventBus.globalBus.post({type: "DidChangeGenome", data: browser.genome.id});
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

let didCompleteOneAttempt = false
async function initializeDropbox() {

    if (true === didCompleteOneAttempt && false === dropboxEnabled) {
        return Promise.resolve(false)
    } else if (true === dropboxEnabled) {
        return Promise.resolve(true)
    } else {
        return new Promise((resolve, reject) => {

            didCompleteOneAttempt = true

            const dropbox = document.createElement('script');

            // dropbox.setAttribute('src', 'http://localhost:9999');
            dropbox.setAttribute('src', 'https://www.dropbox.com/static/api/2/dropins.js');
            dropbox.setAttribute('id', 'dropboxjs');
            dropbox.dataset.appKey = igvwebConfig.dropboxAPIKey;
            dropbox.setAttribute('type', "text/javascript");

            document.head.appendChild(dropbox);

            dropbox.addEventListener('load', () => {
                console.log("Dropbox API loaded successfully")
                dropboxEnabled = true
                resolve(true)
            });

        })
    }

}

export {main}
