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

        $('.igv-app-footer').find('a img').hover(function () {
                $(this).attr('src', $(this).attr('src').replace(/\.png/, '-hover.png') );
            },
            function () {
                $(this).attr('src', $(this).attr('src').replace(/-hover\.png/, '.png') );
            });

        $('#igv-app-bookmark-button').on('click', function (e) {
            let str,
                session;

            str = (/Mac/i.test(navigator.userAgent) ? 'Cmd' : 'Ctrl');
            console.log(str);

            alert('Press ' + str + '+D to bookmark this page.');

            session = app.sessionURL();
            window.history.pushState({}, "IGV", session);
        });

        // Track load controller configuration
        trackLoadConfig =
            {
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

        // Genome Controller
        app.genomeController = new app.GenomeController();

        app.genomeController.getGenomes(app.GenomeController.defaultGenomeURL)
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

                genomeDropdownLayout(config);
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

    function genomeDropdownLayout(config) {

        var $divider,
            $button,
            keys;

        config.$dropdown_menu.empty();

        keys = Object.keys(config.genomeDictionary);

        keys.forEach(function (jsonID) {

            $button = createButton(jsonID);
            config.$dropdown_menu.append($button);

            $button.on('click', function () {
                var key,
                    genome;

                key = $(this).text();

                genome = config.genomeDictionary[ key ];

                igv.browser
                    .loadGenome(genome)
                    .then(function (genome) {

                        if (genome.id && igv.ModalTable.getAssembly(genome.id)) {
                            app.trackLoadController.createEncodeTable(genome.id);
                        } else {
                            app.trackLoadController.encodeTable.hidePresentationButton();
                        }

                    })
                    .catch(function (error) {
                        igv.presentAlert(error);
                    });

            });

        });

        // menu divider
        $divider  = $('<div>', { class:'dropdown-divider' });
        config.$dropdown_menu.append($divider);

        // genome from local file
        $button = createButton('Local File ...');
        config.$dropdown_menu.append($button);
        $button.on('click', function () {
            config.$fileModal.modal();
        });

        // genome from URL
        $button = createButton('URL ...');
        config.$dropdown_menu.append($button);
        $button.on('click', function () {
            config.$urlModal.modal();
        });

        // genome from Dropbox
        $button = createCloudStorageButton(config.$dropdown_menu, config.$dropboxModal, 'Dropbox', 'img/dropbox-dropdown-menu-item.png');

        // genome from Google Drive
        $button = createCloudStorageButton(config.$dropdown_menu, config.$googleDriveModal, 'Google Drive', 'img/googledrive-dropdown-menu-item.png');


        function createButton (title) {
            var $button;

            $button = $('<button>', { class:'dropdown-item', type:'button' });
            $button.text(title);

            return $button;
        }

        function createCloudStorageButton($parent, $modal, title, logo) {
            var $button,
                $container,
                $div,
                $img;

            $button = $('<button>', { class:'dropdown-item', type:'button' });
            $parent.append($button);

            $button.on('click', function () {
                $modal.modal('show');
            });

            // container for text | logo | text
            $container = $('<div>', { class:'igv-app-dropdown-item-cloud-storage' });
            $button.append($container);

            // text
            $div = $('<div>');
            $container.append($div);
            $div.text(title);

            // logo
            $div = $('<div>');
            $container.append($div);
            $img = $('<img>', { src :logo, width :18, height :18 });
            $div.append($img);

            // text
            $div = $('<div>');
            $container.append($div);
            $div.text('...');

        }
    }

    return app;

})(app || {});