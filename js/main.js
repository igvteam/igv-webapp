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

import { MultipleFileLoadController } from '../node_modules/igv-widgets/dist/igv-widgets.js'
import { TrackLoadController, trackLoadControllerConfigurator } from '../node_modules/igv-widgets/dist/igv-widgets.js';
import * as app_google from './app-google.js';
import { setURLShortener, sessionURL } from './shareHelper.js';
import ShareController from './shareController.js';
import SVGController from './svgController.js';
import AlertPanel, { alertPanelConfigurator } from "./alertPanel.js";
import Globals from "./globals.js"
import GenomeLoadController, { genomeMultipleFileLoadConfigurator, genomeDropdownLayout } from "./genomeLoadController.js";
import SessionController, {sessionMultipleFileLoadConfigurator} from "./sessionController.js";


let trackLoadController;
let genomeLoadController;
let sessionController;
let svgController;
let shareController;
let googleEnabled = false;
let alertPanel;
let main = ($container, config) => {

    if (config.clientId && config.clientId !== "CLIENT_ID") {

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

    // Track Load Multiple File Load Controller
    const trackLoadMultipleFileLoadConfig =
        {
            browser,
            modal: document.querySelector('#igv-app-multiple-file-load-modal'),
            localFileInput: document.querySelector('#igv-app-dropdown-local-track-file-input'),
            dropboxButton: document.querySelector('#igv-app-dropdown-dropbox-track-file-button'),
            googleEnabled,
            googleDriveButton: document.querySelector('#igv-app-dropdown-google-drive-track-file-button'),
            modalPresentationHandler: () => {
                $('#igv-app-multiple-file-load-modal').modal('show');
            }
        };


    const { trackRegistryFile } = options;
    const modalDismissHandler = () => {
        $('#igv-app-generic-track-select-modal').modal('hide');
    };
    trackLoadController = new TrackLoadController(trackLoadControllerConfigurator({ browser, trackRegistryFile, multipleFileLoadConfig: trackLoadMultipleFileLoadConfig, modalDismissHandler }));

    // Genome Multiple File Load Controller
    const genomeMultipleFileLoadConfig =
        {
            browser,
            modal: document.querySelector('#igv-app-multiple-file-load-modal'),
            localFileInput: document.querySelector('#igv-app-dropdown-local-genome-file-input'),
            dropboxButton: document.querySelector('#igv-app-dropdown-dropbox-genome-file-button'),
            googleEnabled,
            googleDriveButton: document.querySelector('#igv-app-dropdown-google-drive-genome-file-button')
        };

    // Genome Load Controller
    const genomeLoadConfig =
        {
            modal: document.querySelector('#igv-app-genome-from-url-modal'),
            genomes: options.genomes,
            uberFileLoader: new MultipleFileLoadController(genomeMultipleFileLoadConfigurator(genomeMultipleFileLoadConfig)),
            modalPresentationHandler: () => {
                $('#igv-app-multiple-file-load-modal').modal('show');
            }
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
            genomeDropdownLayout({ browser, genomeDictionary, dropdownMenu: document.querySelector('#igv-app-genome-dropdown-menu') });
        }

    })();

    // Session Multiple File Load Controller
    const sessionMultipleFileLoadConfig =
        {
            browser,
            modal: document.querySelector('#igv-app-multiple-file-load-modal'),
            localFileInput: document.querySelector('#igv-app-dropdown-local-session-file-input'),
            dropboxButton: document.querySelector('#igv-app-dropdown-dropbox-session-file-button'),
            googleEnabled,
            googleDriveButton: document.querySelector('#igv-app-dropdown-google-drive-session-file-button'),
            modalPresentationHandler: () => {
                $('#igv-app-multiple-file-load-modal').modal('show');
            }
        };

    // Session Controller
    const sessionConfig =
        {
            browser,
            sessionLoadModal: document.querySelector('#igv-app-session-from-url-modal'),
            sessionSaveModal: document.querySelector('#igv-app-session-save-modal'),
            uberFileLoader: new MultipleFileLoadController(sessionMultipleFileLoadConfigurator(sessionMultipleFileLoadConfig))
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

const loadGenome = genome => {

    (async (genome) => {

        let g = undefined;
        try {
            g = await Globals.browser.loadGenome(genome);
        } catch (e) {
            igv.Alert.presentAlert(e.message);
        }

        if (g) {
            trackLoadController.updateTrackMenus(g.id);
        } else {
            const e = new Error(`Unable to load genome ${ genome.name }`);
            igv.Alert.presentAlert(e.message);
            throw e;
        }

    })(genome);

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

export { main, alertPanel, loadGenome };
