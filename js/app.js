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
import { Alert, GoogleFilePicker } from '../node_modules/igv-widgets/dist/igv-widgets.js';
import { sessionURL } from './shareHelper.js';
import GenomeLoadController, { genomeLoadConfigurator } from './genomeLoadController.js';
import TrackLoadController, { trackLoadControllerConfigurator } from './trackLoadController.js';
import ShareController, { shareControllerConfigurator } from './shareController.js';
import { SessionController, sessionControllerConfigurator } from '../node_modules/igv-widgets/dist/igv-widgets.js';
import SVGController from './svgController.js';
import Globals from "./globals.js"

$(document).ready(() => main($('#igv-app-container'), igvwebConfig));

let trackLoadController;
let genomeLoadController;
let sessionController;
let svgController;
let shareController;
let googleEnabled = false;

let main = ($container, config) => {

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

                    initializationHelper(browser, $container, config);

                },
                onerror: async (e) => {
                    console.error(e);
                    Alert.presentAlert(e.message)
                }
            };

        gapi.load('client:auth2', googleConfig);

    } else {

        (async () => {
            let browser = await igv.createBrowser($container.get(0), config.igvConfig);
            Globals.browser = browser;
            initializationHelper(browser, $container, config);
        })();

    }
};

let initializationHelper = (browser, $container, options) => {

    createGenomeLoadGUI(browser, options);

    createTrackLoadGUI(browser, options);

    createSessionSaveLoadGUI(browser);

    svgController = new SVGController({ browser, $saveModal: $('#igv-app-svg-save-modal') });

    shareController = new ShareController(shareControllerConfigurator(browser, $container, options));

    createAppBookmarkHandler($('#igv-app-bookmark-button'));

};

const createTrackLoadGUI = (browser, { trackRegistryFile }) => {

    let $igv_app_dropdown_google_drive_track_file_button = $('#igv-app-dropdown-google-drive-track-file-button');
    if (!googleEnabled) {
        $igv_app_dropdown_google_drive_track_file_button.parent().hide();
    }

    const $googleDriveButton = googleEnabled ? $igv_app_dropdown_google_drive_track_file_button : undefined;
    trackLoadController = new TrackLoadController(trackLoadControllerConfigurator({ browser, trackRegistryFile, $googleDriveButton }));

}

const createGenomeLoadGUI = (browser, { genomes }) => {

    genomeLoadController = new GenomeLoadController(browser, genomeLoadConfigurator(browser, { genomes }));
    genomeLoadController.initialize(browser, $('#igv-app-genome-dropdown-menu'))

}

const createSessionSaveLoadGUI = browser => {

    if (!googleEnabled) {
        $('#igv-app-dropdown-google-drive-session-file-button').parent().hide();
    }

    // sessionController = new SessionController(sessionControllerConfigurator(browser));
    sessionController = new SessionController(sessionControllerConfigurator(igv.xhr, igv.google, googleEnabled, async config => { await browser.loadSession(config) }, browser.toJSON));

}

const createAppBookmarkHandler = $bookmark_button => {

    $bookmark_button.on('click', (e) => {
        let blurb,
            str;

        window.history.pushState({}, "IGV", sessionURL());

        str = (/Mac/i.test(navigator.userAgent) ? 'Cmd' : 'Ctrl');
        blurb = 'A bookmark URL has been created. Press ' + str + '+D to save.';
        alert(blurb);
    });

};

export { main, googleEnabled, trackLoadController };
