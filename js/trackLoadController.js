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

    app.TrackLoadController = function (browser, config) {

        var urlConfig;

        this.browser = browser;
        this.config = config;

        // URL
        urlConfig =
            {
                $widgetParent: config.$urlModal.find('.modal-body'),
                mode: 'url',
            };

        this.urlWidget = new app.FileLoadWidget(urlConfig, new app.FileLoadManager());
        app.utils.configureModal(this.urlWidget, config.$urlModal);

        // Annotations
        configureAnnotationsSelectList(config.$annotationsModal);
        this.updateAnnotationsSelectList(browser.genome.id);

        // ENCODE
        this.createEncodeTable(browser.genome.id);

        // GTEX
        configureGTexSelectList(config.$gtexModal);
        this.updateGTexSelectList(browser.genome.id);

    };

    app.TrackLoadController.prototype.hideEncodeDropdownButton = function () {
        this.encodeTable.hidePresentationButton();
    };

    app.TrackLoadController.prototype.hideGTexDropdownButton = function () {
        this.config.$gtexModalPresentationButton.addClass('igv-app-disabled');
        this.config.$gtexModalPresentationButton.text('Genome not supported by GTex');
    };

    app.TrackLoadController.prototype.showGTexDropdownButton = function () {
        this.config.$gtexModalPresentationButton.removeClass('igv-app-disabled');
        this.config.$gtexModalPresentationButton.text('GTEX ...');
    };

    app.TrackLoadController.prototype.createEncodeTable = function (genomeID) {

        var self = this,
            columnFormat,
            encodeDatasource,
            loadTracks,
            encodeTableConfig;

        this.encodeTable = undefined;

        columnFormat =
            [
                {   'Cell Type': '10%' },
                {      'Target': '10%' },
                {  'Assay Type': '10%' },
                { 'Output Type': '20%' },
                {     'Bio Rep': '5%' },
                {    'Tech Rep': '5%'  },
                {      'Format': '5%'  },
                {    'Experiment' : '10%'},
                {         'Lab': '20%' }

            ];

        encodeDatasource = new app.EncodeDataSource(columnFormat);

        loadTracks = function (configurationList) {
            self.browser.loadTrackList(configurationList);
        };

        encodeTableConfig =
            {
                $modal:this.config.$encodeModal,
                $modalBody:this.config.$encodeModal.find('.modal-body'),
                $modalTopCloseButton: this.config.$encodeModal.find('.modal-header button:nth-child(1)'),
                $modalBottomCloseButton: this.config.$encodeModal.find('.modal-footer button:nth-child(1)'),
                $modalGoButton: this.config.$encodeModal.find('.modal-footer button:nth-child(2)'),
                $modalPresentationButton : this.config.$encodeModalPresentationButton,
                datasource: encodeDatasource,
                browserHandler: loadTracks,
                willRetrieveData: function () {
                    self.config.$encodeModalPresentationButton.addClass('igv-app-disabled');
                    self.config.$encodeModalPresentationButton.text('Configuring ENCODE table...');
                },
                didRetrieveData: function () {
                    self.config.$encodeModalPresentationButton.removeClass('igv-app-disabled');
                    self.config.$encodeModalPresentationButton.text('ENCODE ...');
                }
            };

        this.encodeTable = new app.ModalTable(encodeTableConfig);

        this.encodeTable.loadData(genomeID);

    };

    app.TrackLoadController.prototype.updateAnnotationsSelectList = function (genome_id) {

        let $select,
            a,
            b,
            path;

        $select = this.config.$annotationsModal.find('select');

        // discard current annotations
        $select.empty();

        a = 'resources/tracks/';
        b = genome_id + '_tracks.json';
        path = a + b;

        igv.xhr
            .loadJson(path)
            .then(function (tracks) {
                let $option;

                $option = $('<option>', { value:'-', text:'-' });
                $select.append($option);

                tracks
                    .reduce(function($accumulator, track) {
                        let $option;

                        $option = $('<option>', { value:track.name, text:track.name });
                        $option.data('track', track);

                        $accumulator.append($option);

                        return $accumulator;
                    }, $select);

            })
            .catch(function (error) {
                igv.presentAlert(error.message);
            });

    };

    let gtex_lut;
    gtex_lut =
        {
            hg19: 'gtex_v7',
            // hg38: 'gtex_v78'
        };

    app.TrackLoadController.prototype.updateGTexSelectList = function (genome_id) {

        let self = this,
            $select;

        $select = this.config.$gtexModal.find('select');

        // discard current annotations
        $select.empty();

        if (gtex_lut[ genome_id ]) {

            igv.GtexUtils
                .getTissueInfo(gtex_lut[ genome_id ])
                .then((json) => {
                    let $option,
                        tissueInfoList;

                    $option = $('<option>', { value:'-', text:'-' });
                    $select.append($option);

                    tissueInfoList = json['tissueInfo'];

                    tissueInfoList
                        .reduce(function($accumulator, tissueInfo) {
                            let gtexTrack;

                            $option = $('<option>', { value:tissueInfo.tissueName, text:tissueInfo.tissueName });

                            gtexTrack =
                                {
                                    type: "eqtl",
                                    sourceType: "gtex-ws",
                                    url: "https://gtexportal.org/rest/v1/association/singleTissueEqtlByLocationDev",
                                    tissueName: tissueInfo.tissueId,
                                    name: tissueInfo.tissueName,
                                    visibilityWindow: 1000000
                                };

                            $option.data('track', gtexTrack);

                            $accumulator.append($option);

                            return $accumulator;
                        }, $select);

                    self.showGTexDropdownButton();

                })
                .catch(function (error) {
                    igv.presentAlert(error.message);
                });
        } else {

            // hide GTex dropdown button
            self.hideGTexDropdownButton();

        }

    };

    function configureAnnotationsSelectList($modal) {

        let $select;

        $select = $modal.find('select');

        $select.on('change', function (e) {
            let $option,
                json;

            $option = $(this).find('option:selected');
            json = $option.data('track');
            $option.removeAttr("selected");

            igv.browser.loadTrack( json );

            $modal.modal('hide');

        });

    }

    function configureGTexSelectList($modal) {

        let $select;

        $select = $modal.find('select');

        $select.on('change', function (e) {
            let $option,
                config;

            $option = $(this).find('option:selected');
            config = $option.data('track');
            $option.removeAttr("selected");

            igv.browser.loadTrack( config );

            $modal.modal('hide');

        });

    }

    return app;

})(app || {});