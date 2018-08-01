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
var app = (function (app) {

    app.init = function (browser, $container, urlShortenerConfig) {

        let $multipleFileLoadModal,
            mtflConfig,
            mgflConfig,
            sessionConfig,
            tlConfig,
            glConfig,
            shareConfig;

        appFooterImageHoverBehavior($('.igv-app-footer').find('a img'));

        createAppBookmarkHandler(app, $('#igv-app-bookmark-button'));

        $multipleFileLoadModal = $('#igv-app-multiple-file-load-modal');

        mtflConfig =
            {
                $modal: $multipleFileLoadModal,
                modalTitle: 'Track File Error',
                $localFileInput: $('#igv-app-dropdown-local-track-file-input'),
                $dropboxButton: $('#igv-app-dropdown-dropbox-track-file-button'),
                $googleDriveButton: $('#igv-app-dropdown-google-drive-track-file-button'),
                configurationHandler: app.MultipleFileLoadController.trackConfigurator,
                fileLoadHandler: (configurations) => {
                    igv.browser.loadTrackList( configurations );
                }
            };
        app.multipleTrackFileLoader = new app.MultipleFileLoadController(browser, mtflConfig);

        mgflConfig =
            {
                $modal: $multipleFileLoadModal,
                modalTitle: 'Genome File Error',
                $localFileInput: $('#igv-app-dropdown-local-genome-file-input'),
                $dropboxButton: $('#igv-app-dropdown-dropbox-genome-file-button'),
                $googleDriveButton: $('#igv-app-dropdown-google-drive-genome-file-button'),
                configurationHandler: app.MultipleFileLoadController.genomeConfigurator,
                fileLoadHandler: (configurations) => {
                    let config;
                    config = configurations[ 0 ];
                    app.utils.loadGenome(config);
                }
            };

        app.multipleGenomeFileLoader = new app.MultipleFileLoadController(browser, mgflConfig);

        // Genome Modal Controller
        glConfig =
            {
                $urlModal: $('#igv-app-genome-from-url-modal'),
            };
        app.genomeLoadController = new app.GenomeLoadController(browser, glConfig);

        app.genomeLoadController.getAppLaunchGenomes()
            .then(function (dictionary) {
                var gdConfig;

                gdConfig =
                    {
                        browser: browser,
                        genomeDictionary: dictionary,
                        $dropdown_menu: $('#igv-app-genome-dropdown-menu'),
                    };

                app.genomeDropdownLayout(gdConfig);
            });

        // Track load controller configuration
        tlConfig =
            {
                $urlModal: $('#igv-app-track-from-url-modal'),
                $annotationsModal: $('#igv-app-track-from-annotations-modal'),
                $encodeModal: $('#igv-app-encode-modal'),
                $encodeModalPresentationButton: $('#igv-app-encode-button'),
                $gtexModal: $('#igv-app-track-from-gtex-modal'),
                $gtexModalPresentationButton: $('#igv-app-gtex-button'),
            };

        app.trackLoadController = new app.TrackLoadController(browser, tlConfig);

        // Session Modal Controller
        sessionConfig =
            {
                $urlModal: $('#igv-app-session-url-modal'),
                $dropboxModal: $('#igv-app-session-dropbox-modal'),
                $googleDriveModal: $('#igv-app-session-google-drive-modal')
            };
        app.sessionModalController = new app.SessionModalController(browser, sessionConfig);

        $('#igv-app-session-file-input').on('change', function (e) {
            let file;
            file = e.target.files[ 0 ];
            browser.loadSession(file);
        });

        // URL Shortener Configuration
        if (urlShortenerConfig.urlShortener) {

            app.setURLShortener(urlShortenerConfig.urlShortener);

            shareConfig =
                {
                    $modal: $('#igv-app-share-modal'),
                    $share_input: $('#igv-app-share-input'),
                    $copy_link_button: $('#hic-copy-link-button'),
                    $tweet_button_container: $('#igv-app-tweet-button-container'),
                    $email_button: $('#igv-app-email-button'),
                    $embed_button: $('#igv-app-embed-button'),
                    $qrcode_button: $('#igv-app-qrcode-button'),
                    $embed_container: $('#igv-app-embed-container'),
                    $qrcode_image: $('#igv-app-qrcode-image')
                };

            app.shareController = new app.ShareController($container, browser, shareConfig);

        } else {
            $("#igv-app-share-button").hide();
        }

    };

    function appFooterImageHoverBehavior ($img) {

        $img.hover(function () {
                $(this).attr('src', $(this).attr('src').replace(/\.png/, '-hover.png') );
            },
            function () {
                $(this).attr('src', $(this).attr('src').replace(/-hover\.png/, '.png') );
            });

    }

    function createAppBookmarkHandler (app, $bookmark_button) {

        $bookmark_button.on('click', function (e) {
            let blurb,
                str;

            window.history.pushState({}, "IGV", app.sessionURL());

            str = (/Mac/i.test(navigator.userAgent) ? 'Cmd' : 'Ctrl');
            blurb = 'A bookmark URL has been created. Press ' + str + '+D to save.';
            alert(blurb);
        });

    }

    return app;

})(app || {});