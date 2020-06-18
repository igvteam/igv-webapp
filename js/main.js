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

//import igv from '../node_modules/igv/dist/igv.esm.min.js';

import * as app_google from './app-google.js';
import { setURLShortener, sessionURL } from './shareHelper.js';
import { loadGenome } from './utils.js';
import { genomeDropdownLayout } from './genomeLoadController.js';
import MultipleFileLoadController from './multipleFileLoadController.js';
import GenomeLoadController from './genomeLoadController.js';
import TrackLoadController from './trackLoadController.js';
import { trackLoadControllerConfigurator } from './trackLoadController.js';
import ShareController from './shareController.js';
import SessionController from './sessionController.js';
import SVGController from './svgController.js';
import AlertPanel, { alertPanelConfigurator } from "./alertPanel.js";
import Globals from "./globals.js"

let trackLoadController;
let multipleFileGenomeController;
let multipleFileSessionController;
let genomeLoadController;
let sessionController;
let svgController;
let shareController;
let googleEnabled = false;
let alertPanel;


let main = ($container, config) => {

    // const alertDialog = new igv.AlertDialog($container)
    // alertDialog.$container[0].style.top = '300px';
    // if (config.clientId && 'CLIENT_ID' !== config.clientId && (window.location.protocol !== "https:" && window.location.host !== "localhost")) {
    //     const secureUrl = window.location.href.replace("http:", "https:")
    //     console.warn("To enable Google Drive use https://");
    //     alertDialog.present(`Google services are disabled.  To enable Google use <a href="${secureUrl}">${secureUrl}</a>`);
    // }

    const enableGoogle = config.clientId &&
        'CLIENT_ID' !== config.clientId &&
        (window.location.protocol === "https:" || window.location.host === "localhost");
    if (enableGoogle) {

        let browser;
        const gapiConfig =
            {
                callback: () => {

                    (async () => {

                        let ignore = await app_google.init(config.clientId);
                        browser = await igv.createBrowser($container.get(0), config.igvConfig);
                        //  global hack -- there is only 1 browser in this app
                        Globals.browser = browser;
                        googleEnabled = true;
                        app_google.postInit();
                        initializationHelper(browser, $container, config);
                    })();

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

    createAppBookmarkHandler($('#igv-app-bookmark-button'));

    let $multipleFileLoadModal = $('#igv-app-multiple-file-load-modal');

    let $igv_app_dropdown_google_drive_track_file_button = $('#igv-app-dropdown-google-drive-track-file-button');
    if (!googleEnabled) {
        $igv_app_dropdown_google_drive_track_file_button.parent().hide();
    }

    const $googleDriveButton = googleEnabled ? $igv_app_dropdown_google_drive_track_file_button : undefined;
    trackLoadController = new TrackLoadController(trackLoadControllerConfigurator({ browser, trackRegistryFile: options.trackRegistryFile, $googleDriveButton }));

    let $igv_app_dropdown_google_drive_genome_file_button = $('#igv-app-dropdown-google-drive-genome-file-button');
    if (!googleEnabled) {
        $igv_app_dropdown_google_drive_genome_file_button.parent().hide();
    }

    const multipleFileGenomeConfig =
        {
            $modal: $multipleFileLoadModal,
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

    multipleFileGenomeController = new MultipleFileLoadController(browser, multipleFileGenomeConfig);

    // Genome Load Controller
    const genomeLoadConfig =
        {
            $urlModal: $('#igv-app-genome-from-url-modal'),
            genomes: options.genomes,
            uberFileLoader: multipleFileGenomeController
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

    let $igv_app_dropdown_google_drive_session_file_button = $('#igv-app-dropdown-google-drive-session-file-button');
    if (!googleEnabled) {
        $igv_app_dropdown_google_drive_session_file_button.parent().hide();
    }

    // Multiple File Session Controller
    const multipleFileSessionConfig =
        {
            $modal: $multipleFileLoadModal,
            modalTitle: 'Session File Error',
            $localFileInput: $('#igv-app-dropdown-local-session-file-input'),
            multipleFileSelection: false,
            $dropboxButton: $('#igv-app-dropdown-dropbox-session-file-button'),
            $googleDriveButton: googleEnabled ? $igv_app_dropdown_google_drive_session_file_button : undefined,
            configurationHandler: MultipleFileLoadController.sessionConfigurator,
            jsonFileValidator: MultipleFileLoadController.sessionJSONValidator
        };

    multipleFileSessionController = new MultipleFileLoadController(browser, multipleFileSessionConfig);

    // Session Controller
    const sessionConfig =
        {
            browser: browser,
            $urlModal: $('#igv-app-session-from-url-modal'),
            $saveButton: $('#igv-app-save-session-button'),
            $saveModal: $('#igv-app-session-save-modal'),
            uberFileLoader: multipleFileSessionController
        };
    sessionController = new SessionController(sessionConfig);

    // SVG Controller
    const svgConfig =
        {
            browser: browser,
            $saveModal: $('#igv-app-svg-save-modal')
        };
    svgController = new SVGController(svgConfig);

    // URL Shortener Configuration
    let $igv_app_tweet_button_container = $('#igv-app-tweet-button-container');

    let urlShortenerFn;
    if (options.urlShortener) {
        urlShortenerFn = setURLShortener(options.urlShortener) !== undefined;
    }

    if(!urlShortenerFn) {
        $igv_app_tweet_button_container.hide();
    }

    const shareConfig =
        {
            $modal: $('#igv-app-share-modal'),
            $share_input: $('#igv-app-share-input'),
            $copy_link_button: $('#igv-app-copy-link-button'),
            $tweet_button_container: urlShortenerFn ? $igv_app_tweet_button_container : undefined,
            $email_button: $('#igv-app-email-button'),
            $qrcode_button: $('#igv-app-qrcode-button'),
            $qrcode_image: $('#igv-app-qrcode-image'),
            $embed_container: $('#igv-app-embed-container'),
            $embed_button: $('#igv-app-embed-button'),
            embedTarget: options.embedTarget
        };

    shareController = new ShareController($container, browser, shareConfig);

};

let createAppBookmarkHandler = ($bookmark_button) => {

    $bookmark_button.on('click', (e) => {
        let blurb,
            str;

        window.history.pushState({}, "IGV", sessionURL());

        str = (/Mac/i.test(navigator.userAgent) ? 'Cmd' : 'Ctrl');
        blurb = 'A bookmark URL has been created. Press ' + str + '+D to save.';
        alert(blurb);
    });

};

export { main, trackLoadController, alertPanel };
