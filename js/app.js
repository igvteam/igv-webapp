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

    app.init = function ($container, appConfig) {

        var genomeConfig,
            trackLoadConfig,
            shareConfig;

        // Browser Configuration
        igv
            .createBrowser($container.get(0), igvConfigurator())
            .then(function (browser) {

                // Genome controller configuration
                genomeConfig =
                    {
                        $fileModal: $('#igv-app-genome-from-file-modal'),
                        $urlModal: $('#igv-app-genome-from-url-modal')
                    };

                app.genomeController = new app.GenomeController(app, browser, genomeConfig);

                // Track load controller configuration
                trackLoadConfig =
                    {
                        $fileModal: $('#igv-app-track-from-file-or-url-modal'),
                        $urlModal: $('#igv-app-track-from-url-modal'),
                        $encodeModal: $('#igv-app-encode-modal'),
                        $encodeModalPresentationButton: $('#igv-encode-list-item-button')
                    };

                app.trackLoadController = new app.TrackLoadController(browser, trackLoadConfig);



                // URL Shortener Configuration
                if (appConfig.urlShortener) {
                    hic.setURLShortener(appConfig.urlShortener);

                    shareConfig =
                        {
                            $modal: $('#hic-share-modal'),
                            $share_input: $('#hic-share-input'),
                            $copy_link_button: $('#hic-copy-link-button'),
                            $tweet_button_container: $('#hic-tweet-button-container'),
                            $email_button: $('#hic-email-button'),
                            $embed_button: $('#hic-embed-button'),
                            $qrcode_button: $('#hic-qrcode-button'),
                            $embed_container: $('#hic-embed-container'),
                            $qrcode_image: $('#hic-qrcode-image')
                        };

                    app.shareController = new app.ShareController($container, browser, shareConfig);

                } else {
                    $("#hic-share-button").hide();
                }

            });


    };

    function igvConfigurator() {
        var configuration;

        configuration =
            {
                fileLoadWidget:
                    {
                        hidden: false,
                        embed: true,
                        $widgetParent: $('#igv-app-track-from-file-or-url-modal').find('.modal-body')
                    },
                showChromosomeWidget:true,
                promisified:true,
                minimumBases: 6,
                showIdeogram: true,
                showRuler: true,
                locus: 'myc',
                // locus: 'brca1',
                // locus: 'SLC25A3',
                // locus: 'rs28372744',
                // locus: ['egfr', 'myc', 'pten'],
                // locus: ['2', '4', '8'],
                reference:
                    {
                        id: "hg19",
                        fastaURL: "https://s3.amazonaws.com/igv.broadinstitute.org/genomes/seq/1kg_v37/human_g1k_v37_decoy.fasta",
                        cytobandURL: "https://s3.amazonaws.com/igv.broadinstitute.org/genomes/seq/b37/b37_cytoband.txt"
                    },
                flanking: 75000,
                search: {
                    url: "https://dev.gtexportal.org/rest/v1/reference/features/$FEATURE$",
                    resultsField: "features"
                },
                apiKey: 'AIzaSyDUUAUFpQEN4mumeMNIRWXSiTh5cPtUAD0',
                palette:
                    [
                        "#00A0B0",
                        "#6A4A3C",
                        "#CC333F",
                        "#EB6841"
                    ],
                tracks:
                    [
                        {
                            name: "Genes",
                            searchable: false,
                            type: "annotation",
                            format: "gtf",
                            sourceType: "file",
                            url: "https://s3.amazonaws.com/igv.broadinstitute.org/annotations/hg19/genes/gencode.v18.annotation.sorted.gtf.gz",
                            indexURL: "https://s3.amazonaws.com/igv.broadinstitute.org/annotations/hg19/genes/gencode.v18.annotation.sorted.gtf.gz.tbi",
                            visibilityWindow: 10000000,
                            order: Number.MAX_VALUE,
                            displayMode: "EXPANDED"
                        }
                    ]
            };

        return configuration;
    }

    return app;

})(app || {});