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
import * as app_google from './app-google.js';
import { sessionURL } from './shareHelper.js';
import { loadGenome } from './utils.js';
import MultipleFileLoadController from './multipleFileLoadController.js';
import GenomeLoadController, { genomeDropdownLayout } from './genomeLoadController.js';
import TrackLoadController, { trackLoadControllerConfigurator } from './trackLoadController.js';
import ShareController, { shareControllerConfigurator } from './shareController.js';
import SessionController, { sessionControllerConfigurator }from "./sessionController.js";
import SVGController from './svgController.js';
import AlertPanel, { alertPanelConfigurator } from "./alertPanel.js";
import Globals from "./globals.js"

let trackLoadController;
let genomeLoadController;
let sessionController;
let svgController;
let shareController;
let googleEnabled = false;
let alertPanel;


let main = ($container, config) => {

    const enableGoogle = config.clientId &&
        'CLIENT_ID' !== config.clientId &&
        (window.location.protocol === "https:" || window.location.host === "localhost");
    if (enableGoogle) {

        let browser;
        const gapiConfig =
            {
                callback: async () => {

                    await app_google.init(config.clientId);
                    browser = await igv.createBrowser($container.get(0), config.igvConfig);
                    //  global hack -- there is only 1 browser in this app
                    Globals.browser = browser;
                    googleEnabled = true;
                    app_google.postInit();
                    initializationHelper(browser, $container, config);

                },
                onerror: error => {
                    console.log('gapi.client:auth2 - failed to load!');
                    console.error(error);
                    initializationHelper(browser, $container, config);
                }
            };

        gapi.load('client:auth2', gapiConfig);

    } else {

        (async () => {
            let browser = await igv.createBrowser($container.get(0), config.igvConfig);
            Globals.browser = browser;
            initializationHelper(browser, $container, config);
        })();

    }
};

let initializationHelper = (browser, $container, options) => {

    alertPanel = new AlertPanel( alertPanelConfigurator({$container}) );

    createTrackLoadGUI(browser, options);

    createGenomeLoadGUI(browser, options);

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

    let $igv_app_dropdown_google_drive_genome_file_button = $('#igv-app-dropdown-google-drive-genome-file-button');

    if (!googleEnabled) {
        $igv_app_dropdown_google_drive_genome_file_button.parent().hide();
    }

    const uberFileLoaderConfig =
        {
            $modal: $('#igv-app-multiple-file-load-modal'),
            modalTitle: 'Genome File Error',
            $localFileInput: $('#igv-app-dropdown-local-genome-file-input'),
            $dropboxButton: $('#igv-app-dropdown-dropbox-genome-file-button'),
            $googleDriveButton: googleEnabled ? $igv_app_dropdown_google_drive_genome_file_button : undefined,
            configurationHandler: MultipleFileLoadController.genomeConfigurator,
            jsonFileValidator: MultipleFileLoadController.genomeJSONValidator,
            pathValidator: MultipleFileLoadController.genomePathValidator,
            fileLoadHandler: (configurations) => {
                let config = configurations[ 0 ];
                loadGenome(config);
            }
        };

    const uberFileLoader = new MultipleFileLoadController(browser, uberFileLoaderConfig);

    const genomeLoadConfig =
        {
            $urlModal: $('#igv-app-genome-from-url-modal'),
            genomes,
            uberFileLoader
        };

    genomeLoadController = new GenomeLoadController(browser, genomeLoadConfig);

    let genomeDictionary = undefined;
    (async () => {
        try {
            genomeDictionary = await genomeLoadController.getAppLaunchGenomes();
        } catch (e) {
            alertPanel.presentAlert(e.message)
        }

        if (genomeDictionary) {
            genomeDropdownLayout({ browser, genomeDictionary, $dropdown_menu: $('#igv-app-genome-dropdown-menu') });
        }

    })();

}

const createSessionSaveLoadGUI = browser => {

    if (!googleEnabled) {
        $('#igv-app-dropdown-google-drive-session-file-button').parent().hide();
    }

    sessionController = new SessionController(sessionControllerConfigurator(browser));

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

export { main, googleEnabled, trackLoadController, alertPanel };
