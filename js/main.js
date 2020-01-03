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
import { URLShortener, GoogleFilePicker, Alert, SessionFileLoad, GenomeFileLoad, TrackFileLoad } from '../node_modules/igv-widgets/dist/igv-widgets.js';
import ModalTable from '../node_modules/data-modal/js/modalTable.js'
import { sessionURL } from './shareHelper.js';
import ShareController from './shareController.js';
import SVGController from './svgController.js';
import Globals from "./globals.js"

import SessionController from "./sessionController.js";
import GenomeLoadController, { genomeDropdownLayout } from "./genomeLoadController.js";
import TrackLoadController from "./trackLoadController.js";

let betterTrackLoadController;
let genomeLoadController;
let sessionController;
let svgController;
let shareController;
let googleEnabled = false;

$(document).ready(() => {
    main(document.querySelector('#igv-app-container'), igvwebConfig);
});

let main = (container, config) => {

    if (config.clientId && config.clientId !== "CLIENT_ID") {

        let browser;
        const gapiConfig =
            {
                callback: async () => {

                    let ignore = await GoogleFilePicker.init(config.clientId);
                    browser = await igv.createBrowser(container, config.igvConfig);
                    //  global hack -- there is only 1 browser in this app
                    Globals.browser = browser;
                    googleEnabled = true;
                    GoogleFilePicker.postInit();
                    initializationHelper(browser, container, config);

                },
                onerror: error => {
                    console.log('gapi.client:auth2 - failed to load!');
                    console.error(error);
                    initializationHelper(browser, container, config);
                }
            };

        gapi.load('client:auth2', gapiConfig);

    } else {

        (async () => {
            let browser = await igv.createBrowser(container, config.igvConfig);
            Globals.browser = browser;
            initializationHelper(browser, container, config);
        })();

    }
};

let initializationHelper = (browser, container, options) => {

    Alert.init(container);

    createAppBookmarkHandler($('#igv-app-bookmark-button'));


    // track file load config
    const trackFileLoadConfig =
        {
            localFileInput: document.querySelector('#igv-app-dropdown-local-track-file-input'),
            dropboxButton: document.querySelector('#igv-app-dropdown-dropbox-track-file-button'),
            googleEnabled,
            googleDriveButton: document.querySelector('#igv-app-dropdown-google-drive-track-file-button'),
            loadHandler: async configurations => {
                await browser.loadTrackList(configurations);
            }
        };

    // encode modal table config
    const encodeModalTableConfig =
        {
            id: "igv-app-encode-modal",
            title: "ENCODE",
            selectHandler: async trackConfigurations => {

                (async (config) => {
                    await browser.loadTrackList( config )
                })(trackConfigurations);

            }
        };

    const { trackRegistryFile } = options;

    // Better Track Load Controller
    const betterTrackLoadControllerConfig =
        {
            browser,
            trackRegistryFile,
            trackLoadModal: document.querySelector('#igv-app-track-from-url-modal'),
            trackFileLoad: new TrackFileLoad(trackFileLoadConfig),
            encodeModalTable: new ModalTable(encodeModalTableConfig),
            dropdownMenu: document.querySelector('#igv-app-track-dropdown-menu'),
            selectModal: document.querySelector('#igv-app-generic-track-select-modal')
        };

    betterTrackLoadController = new TrackLoadController(betterTrackLoadControllerConfig);

    // genome file load config
    const genomeFileLoadConfig =
        {
            localFileInput: document.querySelector('#igv-app-dropdown-local-genome-file-input'),
            dropboxButton: document.querySelector('#igv-app-dropdown-dropbox-genome-file-button'),
            googleEnabled,
            googleDriveButton: document.querySelector('#igv-app-dropdown-google-drive-genome-file-button'),
            loadHandler: async config => {
                await loadGenome(config);
            }
        };

    // Genome Load Controller
    const genomeLoadControllerConfig =
        {
            genomes: options.genomes,
            genomeLoadModal: document.querySelector('#igv-app-genome-from-url-modal'),
            genomeFileLoad: new GenomeFileLoad(genomeFileLoadConfig)
        };

    genomeLoadController = new GenomeLoadController(genomeLoadControllerConfig);

    let genomeDictionary = undefined;
    (async () => {
        try {
            genomeDictionary = await genomeLoadController.getAppLaunchGenomes();
        } catch (e) {
            Alert.presentAlert(e.message)
        }

        if (genomeDictionary) {
            genomeDropdownLayout({ browser, genomeDictionary, dropdownMenu: document.querySelector('#igv-app-genome-dropdown-menu') });
        }

    })();

    // session file load config
    const sessionFileLoadConfig =
        {
            localFileInput: document.querySelector('#igv-app-dropdown-local-session-file-input'),
            dropboxButton: document.querySelector('#igv-app-dropdown-dropbox-session-file-button'),
            googleEnabled,
            googleDriveButton: document.querySelector('#igv-app-dropdown-google-drive-session-file-button'),
            loadHandler: config => browser.loadSession(config)
        };

    // Session Controller
    const sessionControllerConfig =
        {
            sessionLoadModal: document.querySelector('#igv-app-session-from-url-modal'),
            sessionSaveModal: document.querySelector('#igv-app-session-save-modal'),
            sessionFileLoad: new SessionFileLoad(sessionFileLoadConfig),
            JSONProvider: () => browser.toJSON()
        };
    sessionController = new SessionController(sessionControllerConfig);

    // SVG Controller
    const svgConfig =
        {
            browser: browser,
            $saveModal: $('#igv-app-svg-save-modal')
        };
    svgController = new SVGController(svgConfig);

    // URL Shortener Configuration
    let $igv_app_tweet_button_container = $('#igv-app-tweet-button-container');

    if (options.urlShortener) {
        URLShortener.setURLShortenerList(options.urlShortener);
    }

    if(false === URLShortener.isURLShortenerSet()) {
        $igv_app_tweet_button_container.hide();
    }

    const shareConfig =
        {
            $modal: $('#igv-app-share-modal'),
            $share_input: $('#igv-app-share-input'),
            $copy_link_button: $('#igv-app-copy-link-button'),
            $tweet_button_container: URLShortener.isURLShortenerSet() ? $igv_app_tweet_button_container : undefined,
            $email_button: $('#igv-app-email-button'),
            $qrcode_button: $('#igv-app-qrcode-button'),
            $qrcode_image: $('#igv-app-qrcode-image'),
            $embed_container: $('#igv-app-embed-container'),
            $embed_button: $('#igv-app-embed-button'),
            embedTarget: options.embedTarget
        };

    shareController = new ShareController(container, browser, shareConfig);

};

const loadGenome = async genome => {

    let g = undefined;
    try {
        g = await Globals.browser.loadGenome(genome);
    } catch (e) {
        Alert.presentAlert(e.message);
    }

    if (g) {
        const dropdownMenu = document.querySelector('#igv-app-track-dropdown-menu');
        const selectModal = document.querySelector('#igv-app-generic-track-select-modal');
        const { browser } = Globals;
        betterTrackLoadController.updateTrackMenus(browser, browser.genome.id, betterTrackLoadController.trackRegistryFile, dropdownMenu, selectModal);
    } else {
        const e = new Error(`Unable to load genome ${ genome.name }`);
        Alert.presentAlert(e.message);
        throw e;
    }

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

export { main, loadGenome };
