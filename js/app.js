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

        let sessionConfig,
            trackLoadConfig,
            genomeLoadConfig,
            shareConfig;

        appFooterImageHoverBehavior($('.igv-app-footer').find('a img'));

        createAppBookmarkHandler(app, $('#igv-app-bookmark-button'));

        // Track load controller configuration
        trackLoadConfig =
            {
                $annotationsSelect: $('#igv-app-annotation-selector'),
                $fileModal: $('#igv-app-track-from-local-file-modal'),
                $urlModal: $('#igv-app-track-from-url-modal'),
                $dropboxModal: $('#igv-app-track-dropbox-modal'),
                $googleDriveModal: $('#igv-app-track-google-drive-modal'),
                $encodeModal: $('#igv-app-encode-modal'),
                $encodeModalPresentationButton: $('#igv-encode-list-item-button')
            };

        app.trackLoadController = new app.TrackLoadController(browser, trackLoadConfig);

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

        // Genome Modal Controller
        genomeLoadConfig =
            {
                $urlModal: $('#igv-app-genome-from-url-modal'),
                $fileModal: $('#igv-app-genome-from-file-modal'),
                $dropboxModal: $('#igv-app-genome-dropbox-modal'),
                $googleDriveModal: $('#igv-app-genome-google-drive-modal')
            };
        app.genomeLoadController = new app.GenomeLoadController(browser, genomeLoadConfig);

        app.genomeLoadController.getAppLaunchGenomes()
            .then(function (genomeDictionary) {
                var config;

                config =
                    {
                        browser: browser,
                        $urlModal: $('#igv-app-genome-from-url-modal'),
                        $fileModal: $('#igv-app-genome-from-file-modal'),
                        $dropboxModal: $('#igv-app-genome-dropbox-modal'),
                        $googleDriveModal: $('#igv-app-genome-google-drive-modal'),
                        $dropdown_menu: $('#igv-app-genome-dropdown').find('.dropdown-menu'),
                        genomeDictionary: genomeDictionary
                    };

                app.genomeDropdownLayout(browser, config);
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

        browser.updateViews();

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