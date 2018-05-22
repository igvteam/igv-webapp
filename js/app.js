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

    app.init = function ($container, urlShortenerConfig, igvConfig) {

        igv
            .createBrowser($container.get(0), igvConfig)
            .then(function (browser) {
                let trackLoadConfig,
                    shareConfig;

                $('a').find('img').hover(function () {
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
                        $fileModal: $('#igv-app-track-from-file-or-url-modal'),
                        $urlModal: $('#igv-app-track-from-url-modal'),
                        $encodeModal: $('#igv-app-encode-modal'),
                        $encodeModalPresentationButton: $('#igv-encode-list-item-button')
                    };

                app.trackLoadController = new app.TrackLoadController(browser, trackLoadConfig);

                // Session Modal Controller
                app.sessionModalController = new app.SessionModalController(browser, $('#igv-app-session-from-file-or-url-modal'));

                // Genome Modal Controller
                app.genomeModalController = new app.GenomeModalController(browser, $('#igv-app-genome-from-file-or-url-modal'));

                // Genome Controller
                app.genomeController = new app.GenomeController();

                app.genomeController.getGenomes(app.GenomeController.defaultGenomeURL)
                    .then(function (genomeDictionary) {
                        var config;

                        config =
                            {
                                browser: browser,
                                $modal: $('#igv-app-genome-from-file-or-url-modal'),
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

            });

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

                config.browser.loadGenome(genome);
                app.trackLoadController.createEncodeTable(genome.id);
            });

        });

        // menu divider
        $divider  = $('<div>', { class:'dropdown-divider' });
        config.$dropdown_menu.append($divider);

        // genome from file or url button
        $button = createButton('file or url ...');
        config.$dropdown_menu.append($button);
        $button.on('click', function () {
            config.$modal.modal();
        });

    }

    function createButton (title) {
        var $button;

        $button = $('<button>', { class:'dropdown-item', type:'button' });
        $button.text(title);

        return $button;
    }

    return app;

})(app || {});