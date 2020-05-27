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

import igv from '../node_modules/igv/dist/igv.esm.js';
import { Alert, GoogleFilePicker, MultipleTrackFileLoad, SessionController, SessionFileLoad } from '../node_modules/igv-widgets/dist/igv-widgets.js';
import { ModalTable } from '../node_modules/data-modal/js/index.js';
import Globals from "./globals.js"
import TrackLoadController from './trackLoadController.js';
import { creatGenomeWidgets, initializeGenomeWidgets, genomeWidgetConfigurator } from './genomeWidgets.js';
import { shareWidgetConfigurator, createShareWidgets } from './shareWidgets.js';
import { sessionURL } from './shareHelper.js';
import { createSVGWidget } from './svgWidget.js';

$(document).ready(async () => main($('#igv-app-container'), igvwebConfig));

let trackLoadController;
let sessionController;
let svgController;
let googleEnabled = false;

let main = async ($container, config) => {

    Alert.init($container.get(0));

    const enableGoogle = config.clientId && 'CLIENT_ID' !== config.clientId && (window.location.protocol === "https:" || window.location.host === "localhost");

    if (enableGoogle) {

        let browser;
        const googleConfig =
            {
                callback: async () => {

                    try {
                        await GoogleFilePicker.init(config.clientId, igv.oauth, igv.google);
                        googleEnabled = true;
                    } catch (e) {
                        console.error(e);
                        Alert.presentAlert(e.message)
                    }

                    browser = await igv.createBrowser($container.get(0), config.igvConfig);
                    Globals.browser = browser;

                    if (googleEnabled) {
                        GoogleFilePicker.postInit();
                    }

                    await initializationHelper(browser, $container, config);

                },
                onerror: async (e) => {
                    console.error(e);
                    Alert.presentAlert(e.message)
                }
            };

        gapi.load('client:auth2', googleConfig);

    } else {

        let browser = await igv.createBrowser($container.get(0), config.igvConfig);
        Globals.browser = browser;
        await initializationHelper(browser, $container, config);

    }
}

let initializationHelper = async (browser, $container, options) => {

    creatGenomeWidgets(genomeWidgetConfigurator())
    await initializeGenomeWidgets(browser, options.genomes, $('#igv-app-genome-dropdown-menu'))

    createTrackLoadGUI(browser, options);

    createSessionSaveLoadGUI(browser);

    createSVGWidget({ browser, $saveModal: $('#igv-app-svg-save-modal') })

    createShareWidgets(shareWidgetConfigurator(browser, $container, options));

    createAppBookmarkHandler($('#igv-app-bookmark-button'));

}

const createTrackLoadGUI = (browser, { trackRegistryFile }) => {

    let $igv_app_dropdown_google_drive_track_file_button = $('#igv-app-dropdown-google-drive-track-file-button');
    if (!googleEnabled) {
        $igv_app_dropdown_google_drive_track_file_button.parent().hide();
    }

    const $googleDriveButton = googleEnabled ? $igv_app_dropdown_google_drive_track_file_button : undefined;
    trackLoadController = new TrackLoadController(trackLoadControllerConfigurator({ browser, trackRegistryFile, $googleDriveButton, igvxhr: igv.xhr, google: igv.google }));

}

const trackLoadControllerConfigurator = ({ browser, trackRegistryFile, $googleDriveButton, igvxhr, google }) => {

    const encodeModalTableConfig =
        {
            id: "igv-app-encode-modal",
            title: "ENCODE",
            selectionStyle: 'multi',
            pageLength: 100,
            selectHandler: async trackConfigurations => await browser.loadTrackList( trackConfigurations )
        };

    const multipleTrackFileLoadConfig =
        {
            $localFileInput: $('#igv-app-dropdown-local-track-file-input'),
            $dropboxButton: $('#igv-app-dropdown-dropbox-track-file-button'),
            $googleDriveButton,
            fileLoadHandler: async configurations => await browser.loadTrackList(configurations),
            multipleFileSelection: true,
            igvxhr,
            google
        };

    return {
        browser,
        trackRegistryFile,
        $urlModal: $('#igv-app-track-from-url-modal'),
        encodeModalTable: new ModalTable(encodeModalTableConfig),
        $dropdownMenu: $('#igv-app-track-dropdown-menu'),
        $genericTrackSelectModal: $('#igv-app-generic-track-select-modal'),
        multipleTrackFileLoad: new MultipleTrackFileLoad(multipleTrackFileLoadConfig)
    }

}

const createSessionSaveLoadGUI = browser => {

    if (!googleEnabled) {
        $('#igv-app-dropdown-google-drive-session-file-button').parent().hide();
    }

    sessionController = new SessionController(sessionControllerConfigurator('igv-webapp', igv.xhr, igv.google, googleEnabled, async config => { await browser.loadSession(config) }, () => browser.toJSON()));

}

const sessionControllerConfigurator = (prefix, igvxhr, google, googleEnabled, loadHandler, JSONProvider) => {

    // Session File Load
    const sessionFileLoadConfig =
        {
            localFileInput: document.querySelector('#igv-app-dropdown-local-session-file-input'),
            dropboxButton: document.querySelector('#igv-app-dropdown-dropbox-session-file-button'),
            googleEnabled,
            googleDriveButton: document.querySelector('#igv-app-dropdown-google-drive-session-file-button'),
            loadHandler,
            igvxhr,
            google
        };

    // Session Controller
    return {
        prefix,
        sessionLoadModal: document.querySelector('#igv-app-session-from-url-modal'),
        sessionSaveModal: document.querySelector('#igv-app-session-save-modal'),
        sessionFileLoad: new SessionFileLoad(sessionFileLoadConfig),
        JSONProvider
    }
};

const createAppBookmarkHandler = $bookmark_button => {

    $bookmark_button.on('click', (e) => {
        let blurb,
            str;

        window.history.pushState({}, "IGV", sessionURL());

        str = (/Mac/i.test(navigator.userAgent) ? 'Cmd' : 'Ctrl');
        blurb = 'A bookmark URL has been created. Press ' + str + '+D to save.';
        alert(blurb);
    });

}

export { main, googleEnabled, trackLoadController }
