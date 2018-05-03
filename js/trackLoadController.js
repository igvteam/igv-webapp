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

    app.TrackLoadController = function (app, browser, config) {

        var self = this,
            columnFormat,
            encodeDatasource,
            loadTracks,
            encodeTableConfig,
            $file_ok,
            $file_dismiss;

        // ENCODE table configuration
        columnFormat =
            [
                {    'Assembly': '10%' },
                {   'Cell Type': '10%' },
                {      'Target': '10%' },
                {  'Assay Type': '20%' },
                { 'Output Type': '20%' },
                {         'Lab': '20%' }

            ];

        encodeDatasource = new igv.EncodeDataSource(columnFormat);

        loadTracks = function (configurationList) {
            browser.loadTrackList(configurationList);
        };

        encodeTableConfig =
            {
                $modal:config.$encodeModal,
                $modalBody:config.$encodeModal.find('.modal-body'),
                $modalTopCloseButton: config.$encodeModal.find('.modal-header').children('button'),
                $modalBottomCloseButton: config.$encodeModal.find('.modal-footer button:nth-child(1)'),
                $modalGoButton: config.$encodeModal.find('.modal-footer button:nth-child(2)'),
                datasource: encodeDatasource,
                browserHandler: loadTracks,
                willRetrieveData: function () {
                    config.$encodeModalPresentationButton.addClass('igv-app-disabled');
                    config.$encodeModalPresentationButton.text('Configuring ENCODE table...');
                },
                didRetrieveData: function () {
                    config.$encodeModalPresentationButton.removeClass('igv-app-disabled');
                    config.$encodeModalPresentationButton.text('Load Tracks from ENCODE...');
                }
            };

        this.encodeTable = new igv.ModalTable(encodeTableConfig);

        // upper dismiss - x - button
        $file_dismiss = config.$fileModal.find('.modal-header').children('button');
        $file_dismiss.on('click', function () {
            browser.trackFileLoad.dismiss();
        });

        // lower dismiss - close - button
        $file_dismiss = config.$fileModal.find('.modal-footer button:nth-child(1)');
        $file_dismiss.on('click', function () {
            browser.trackFileLoad.dismiss();
        });

        // ok - button
        $file_ok = config.$fileModal.find('.modal-footer button:nth-child(2)');
        $file_ok.on('click', function () {
            browser.trackFileLoad.okHandler();
        });

    };

    return app;

})(app || {});