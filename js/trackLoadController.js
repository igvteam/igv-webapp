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

        var self = this,
            $file_ok,
            $file_dismiss,
            locaFileLoaderConfig,
            urlLoaderConfig,
            dropboxLoaderConfig,
            googleDriveLoaderConfig;

        this.browser = browser;
        this.config = config;


        // local file load modal
        locaFileLoaderConfig =
            {
                hidden: false,
                embed: true,
                $widgetParent: config.$fileModal.find('.modal-body'),
                // mode: 'url',
                mode: 'localFile'
            };

        this.localFileLoader = browser.createFileLoadWidget(locaFileLoaderConfig);

        // upper dismiss - x - button
        $file_dismiss = config.$fileModal.find('.modal-header button:nth-child(1)');
        $file_dismiss.on('click', function () {
            self.localFileLoader.dismiss();
        });

        // lower dismiss - close - button
        $file_dismiss = config.$fileModal.find('.modal-footer button:nth-child(1)');
        $file_dismiss.on('click', function () {
            self.localFileLoader.dismiss();
        });

        // ok - button
        $file_ok = config.$fileModal.find('.modal-footer button:nth-child(2)');
        $file_ok.on('click', function () {
            self.localFileLoader.okHandler();
        });

        // url load modal
        urlLoaderConfig =
            {
                hidden: false,
                embed: true,
                $widgetParent: config.$urlModal.find('.modal-body'),
                mode: 'url',
                // mode: 'localFile'
            };

        this.urlLoader = browser.createFileLoadWidget(urlLoaderConfig);

        // upper dismiss - x - button
        $file_dismiss = config.$urlModal.find('.modal-header button:nth-child(1)');
        $file_dismiss.on('click', function () {
            self.urlLoader.dismiss();
        });

        // lower dismiss - close - button
        $file_dismiss = config.$urlModal.find('.modal-footer button:nth-child(1)');
        $file_dismiss.on('click', function () {
            self.urlLoader.dismiss();
        });

        // ok - button
        $file_ok = config.$urlModal.find('.modal-footer button:nth-child(2)');
        $file_ok.on('click', function () {
            self.urlLoader.okHandler();
        });

        // Dropbox
        this.dropboxController = config.dropboxController;
        this.dropboxController.configure({ browser: browser });

        // ENCODE
        this.createEncodeTable(browser.genome.id);
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
                {    'Assembly': '10%' },
                {   'Cell Type': '10%' },
                {      'Target': '10%' },
                {  'Assay Type': '20%' },
                { 'Output Type': '20%' },
                {         'Lab': '20%' }

            ];

        encodeDatasource = new igv.EncodeDataSource(columnFormat);

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
                    self.config.$encodeModalPresentationButton.text('ENCODE');
                }
            };

        this.encodeTable = new igv.ModalTable(encodeTableConfig);

        this.encodeTable.loadData(genomeID);

    };

    return app;

})(app || {});