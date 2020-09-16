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

import {GoogleAuth} from '../node_modules/igv-utils/src/index.js';
import {
    AlertSingleton,
    createSessionWidgets,
    createTrackWidgetsWithTrackRegistry,
    dropboxButtonImageBase64,
    dropboxDropdownItem,
    EventBus,
    googleDriveButtonImageBase64,
    googleDriveDropdownItem
} from '../node_modules/igv-widgets/dist/igv-widgets.js'
import Globals from "./globals.js"
import {creatGenomeWidgets, genomeWidgetConfigurator, initializeGenomeWidgets} from './genomeWidgets.js';
import {createShareWidgets, shareWidgetConfigurator} from './shareWidgets.js';
import {sessionURL} from './shareHelper.js';
import {createSVGWidget} from './svgWidget.js';
import version from "./version.js";

$(document).ready(async () => main($('#igv-app-container'), igvwebConfig));

let googleEnabled = false;

// For development with igv.js (1) comment out the script include of igv.min.js in index.html, (2) uncomment the 2 lines below
// import igv from '../node_modules/igv/dist/igv.js'
// import igv from '../node_modules/igv/dist/igv.esm.js'
// window.igv = igv;

async function main($container, config) {

    AlertSingleton.init($container.get(0))

    $('#igv-app-version').text(`IGV-Web app version ${version()}`)
    $('#igv-igvjs-version').text(`igv.js version ${igv.version()}`)

    const enableGoogle = config.clientId &&
        'CLIENT_ID' !== config.clientId &&
        (window.location.protocol === "https:" || window.location.host === "localhost");

    if (enableGoogle) {
        try {
            await GoogleAuth.init({
                client_id: config.clientId,
                scope: 'https://www.googleapis.com/auth/userinfo.profile'
            })
            googleEnabled = true;
        } catch (e) {
            console.error(e);
            AlertSingleton.present(e.message)
        }
    }

    const browser = await igv.createBrowser($container.get(0), config.igvConfig);

    if (browser) {
        Globals.browser = browser;
        await initializationHelper(browser, $container, config);
    }
}

async function initializationHelper(browser, $container, options) {

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

    creatGenomeWidgets(genomeWidgetConfigurator(googleEnabled))
    await initializeGenomeWidgets(browser, options.genomes, $('#igv-app-genome-dropdown-menu'))

    const $main = $('#igv-main')

    createTrackWidgetsWithTrackRegistry($main,
        $('#igv-app-track-dropdown-menu'),
        $('#igv-app-dropdown-local-track-file-input'),
        $('#igv-app-dropdown-dropbox-track-file-button'),
        googleEnabled,
        $('#igv-app-dropdown-google-drive-track-file-button'),
        ['igv-app-encode-signal-modal', 'igv-app-encode-others-modal'],
        'igv-app-track-from-url-modal',
        'igv-app-track-select-modal',
        igv.xhr,
        igv.GtexUtils,
        options.trackRegistryFile,
        async configurations => await browser.loadTrackList(configurations));

    $('#igv-app-session-save-button').on('click', () => {

        let json = undefined
        try {
            json = browser.toJSON()
        } catch (e) {
            AlertSingleton.present(e.message)
        }

        if (json) {
            $('#igv-app-session-save-modal').modal('show')
        }

    })

    createSessionWidgets($main,
        igv.xhr,
        'igv-webapp',
        'igv-app-dropdown-local-session-file-input',
        'igv-app-dropdown-dropbox-session-file-button',
        'igv-app-dropdown-google-drive-session-file-button',
        'igv-app-session-url-modal',
        'igv-app-session-save-modal',
        googleEnabled,
        async config => {await browser.loadSession(config)}, () => browser.toJSON());

    createSVGWidget({browser, $saveModal: $('#igv-app-svg-save-modal')})

    createShareWidgets(shareWidgetConfigurator(browser, $container, options));

    createAppBookmarkHandler($('#igv-app-bookmark-button'));

    EventBus.globalBus.post({type: "DidChangeGenome", data: {genomeID: browser.genome.id}});
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

export {main}
