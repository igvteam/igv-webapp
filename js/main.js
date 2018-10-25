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

import * as app_google from './app-google.js';
import { setURLShortener, sessionURL } from './shareHelper.js';
import { loadGenome } from './utils.js';
import { genomeDropdownLayout } from './genomeLoadController.js';
import MultipleFileLoadController from './multipleFileLoadController.js';
import GenomeLoadController from './genomeLoadController.js';
import TrackLoadController from './trackLoadController.js';
import ShareController from './shareController.js';
import SessionController from './sessionController.js';

let trackLoadController;
let multipleTrackFileLoader;
let multipleGenomeFileLoader;
let genomeLoadController;
let sessionController;
let shareController;
let googleEnabled = false;

let main = ($container, config) => {

    if (config.clientId && config.clientId !== "CLIENT_ID") {

        const gapiConfig =
            {
                callback: () => {

                    app_google

                        .init(config.clientId)

                        .then((ignore) => {

                            return igv.createBrowser($container.get(0), config.igvConfig);
                        })

                        .then((browser) => {

                            googleEnabled = true;

                            app_google.postInit();

                            initializationHelper(browser, $container, config);
                        });
                },
                onerror: (error) => {
                    console.log('gapi.client:auth2 - failed to load!');
                    console.error(error);
                    initializationHelper(browser, $container, config);
                }
            };

        gapi.load('client:auth2', gapiConfig);

    } else {

        igv
            .createBrowser($container.get(0), config.igvConfig)

            .then((browser) => {
                initializationHelper(browser, $container, config);
            });
    }
};

let initializationHelper = (browser, $container, options) => {

    let $multipleFileLoadModal,
        mtflConfig,
        mgflConfig,
        sessionConfig,
        tlConfig,
        glConfig,
        shareConfig,
        $igv_app_dropdown_google_drive_track_file_button,
        $igv_app_dropdown_google_drive_genome_file_button;

    appFooterImageHoverBehavior($('#igv-app-ucsd-logo').find('img'));
    appFooterImageHoverBehavior($('#igv-app-broad-logo').find('img'));

    createAppBookmarkHandler($('#igv-app-bookmark-button'));

    $multipleFileLoadModal = $('#igv-app-multiple-file-load-modal');

    $igv_app_dropdown_google_drive_track_file_button = $('#igv-app-dropdown-google-drive-track-file-button');
    if (!googleEnabled) {
        $igv_app_dropdown_google_drive_track_file_button.parent().hide();
    }

    mtflConfig =
        {
            $modal: $multipleFileLoadModal,
            modalTitle: 'Track File Error',
            $localFileInput: $('#igv-app-dropdown-local-track-file-input'),
            $dropboxButton: $('#igv-app-dropdown-dropbox-track-file-button'),
            $googleDriveButton: googleEnabled ? $igv_app_dropdown_google_drive_track_file_button : undefined,
            configurationHandler: MultipleFileLoadController.trackConfigurator,
            fileLoadHandler: (configurations) => {
                browser.loadTrackList( configurations );
            }
        };
    multipleTrackFileLoader = new MultipleFileLoadController(browser, mtflConfig);

    $igv_app_dropdown_google_drive_genome_file_button = $('#igv-app-dropdown-google-drive-genome-file-button');
    if (!googleEnabled) {
        $igv_app_dropdown_google_drive_genome_file_button.parent().hide();
    }

    mgflConfig =
        {
            $modal: $multipleFileLoadModal,
            modalTitle: 'Genome File Error',
            $localFileInput: $('#igv-app-dropdown-local-genome-file-input'),
            $dropboxButton: $('#igv-app-dropdown-dropbox-genome-file-button'),
            $googleDriveButton: googleEnabled ? $igv_app_dropdown_google_drive_genome_file_button : undefined,
            configurationHandler: MultipleFileLoadController.genomeConfigurator,
            fileLoadHandler: (configurations) => {
                let config;
                config = configurations[ 0 ];
                loadGenome(config);
            }
        };

    multipleGenomeFileLoader = new MultipleFileLoadController(browser, mgflConfig);

    // Genome Modal Controller
    glConfig =
        {
            $urlModal: $('#igv-app-genome-from-url-modal'),
            genomes: options.genomes
        };
    genomeLoadController = new GenomeLoadController(browser, glConfig);

    genomeLoadController.getAppLaunchGenomes()

        .then((dictionary) => {

            if (dictionary) {

                let gdConfig =
                    {
                        browser: browser,
                        genomeDictionary: dictionary,
                        $dropdown_menu: $('#igv-app-genome-dropdown-menu'),
                    };

                genomeDropdownLayout(gdConfig);
            }
            else {
                // TODO -- hide Genomes button
            }
        });

    // Track load controller configuration
    tlConfig =
        {
            trackRegistryFile: options.trackRegistryFile,
            $urlModal: $('#igv-app-track-from-url-modal'),
            $encodeModal: $('#igv-app-encode-modal'),
            $dropdownMenu: $('#igv-app-track-dropdown-menu'),
            $genericTrackSelectModal: $('#igv-app-generic-track-select-modal')
        };

    trackLoadController = new TrackLoadController(browser, tlConfig);

    // Session Controller
    sessionConfig =
        {
            browser: browser,
            $saveButton: $('#igv-app-save-session-button'),
            $loadInput: $('#igv-app-load-session-file-input')
        };

    sessionController = new SessionController(sessionConfig);

    // URL Shortener Configuration
    let $igv_app_tweet_button_container = $('#igv-app-tweet-button-container');


    let urlShortenerFn;
    if (options.urlShortener) {
        urlShortenerFn = setURLShortener(options.urlShortener) !== undefined;
    }

    if(!urlShortenerFn) {
        $igv_app_tweet_button_container.hide();
    }

    shareConfig =
        {
            $modal: $('#igv-app-share-modal'),
            $share_input: $('#igv-app-share-input'),
            $copy_link_button: $('#igv-app-copy-link-button'),
            $tweet_button_container: urlShortenerFn ? $igv_app_tweet_button_container : undefined,
            $email_button: $('#igv-app-email-button'),
            $embed_button: $('#igv-app-embed-button'),
            $qrcode_button: $('#igv-app-qrcode-button'),
            $embed_container: $('#igv-app-embed-container'),
            $qrcode_image: $('#igv-app-qrcode-image'),
            embedTarget: options.embedTarget
        };

    shareController = new ShareController($container, browser, shareConfig);

};

let appFooterImageHoverBehavior = ($img) => {

    $img.hover(() => {
            let src,
                replacement;

            src = $img.attr('src');

            replacement = src.replace(/\.png/, '-hover.png');

            $img.attr('src', replacement );
        },
        () => {

            let src,
                replacement;

            src = $img.attr('src');

            replacement = src.replace(/-hover\.png/, '.png');

            $img.attr('src', replacement );

        });

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

export { main, trackLoadController };