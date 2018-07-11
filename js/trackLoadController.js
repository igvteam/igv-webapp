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
            locaFileLoaderConfig,
            urlLoaderConfig,
            okHandler;

        this.fileReader = new FileReader();
        app.utils.promisifyFileReader(this.fileReader);

        this.browser = browser;
        this.config = config;

        // Local File
        locaFileLoaderConfig =
            {
                hidden: false,
                embed: true,
                $widgetParent: config.$fileModal.find('.modal-body'),
                mode: 'localFile'
            };

        this.localFileLoader = app.utils.createFileLoadWidget(locaFileLoaderConfig, new app.FileLoadManager());
        app.utils.configureModal(this.localFileLoader, config.$fileModal);

        // URL
        urlLoaderConfig =
            {
                hidden: false,
                embed: true,
                $widgetParent: config.$urlModal.find('.modal-body'),
                mode: 'url',
            };

        this.urlLoader = app.utils.createFileLoadWidget(urlLoaderConfig, new app.FileLoadManager());
        app.utils.configureModal(this.urlLoader, config.$urlModal);



        // Dropbox
        this.dropboxController = new app.DropboxController(browser, config.$dropboxModal);

        okHandler = function (loader, $modal) {

            if (loader.okHandler()) {
                loader.dismiss();
                $modal.modal('hide');
            }

        };

        this.dropboxController.configure(okHandler, false);


        // Google Drive
        this.googleDriveController = new app.GoogleDriveController(browser, config.$googleDriveModal);
        this.googleDriveController.configure(function (obj, $filenameContainer, index) {
            let lut,
                key;

            // update file name label
            $filenameContainer.text(obj.name);
            $filenameContainer.show();

            lut =
                [
                    'data',
                    'index'
                ];

            // fileLoadManager dictionary key
            key = lut[index];

            if ('data' === key) {
                self.googleDriveController.loader.fileLoadManager.name = obj.name;
            }

            self.googleDriveController.loader.fileLoadManager.dictionary[key] = obj.path;

            self.googleDriveController.$modal.modal('show');

        }, googlDriveTrackOKHandler);

        // Annotations
        configureAnnotationsSelectList(config.$annotationsModal);
        this.updateAnnotationsSelectList(browser.genome.id);

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
                {   'Cell Type': '10%' },
                {      'Target': '10%' },
                {  'Assay Type': '10%' },
                { 'Output Type': '20%' },
                {     'Bio Rep': '5%' },
                {    'Tech Rep': '5%'  },
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
                    self.config.$encodeModalPresentationButton.text('ENCODE ...');
                }
            };

        this.encodeTable = new igv.ModalTable(encodeTableConfig);

        this.encodeTable.loadData(genomeID);

    };

    function configureAnnotationsSelectList($modal) {

        let $select,
            path_template,
            joint,
            path;

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

    app.TrackLoadController.prototype.updateAnnotationsSelectList = function (genome_id) {

        let $select,
            path_template,
            joint,
            path;

        $select = this.config.$annotationsModal.find('select');

        path_template = 'resources/tracks.json';
        joint = '/' + genome_id + '_';
        path = path_template.split('/').join(joint);

        igv.xhr
            .loadJson(path)
            .then(function (tracks) {
                let $option;

                // discard current annotations
                $select.empty();

                $option = $('<option>', { value:'-', text:'-' });
                $select.append($option);

                tracks.forEach(function (track) {
                    $option = $('<option>', { value:track.name, text:track.name });
                    $option.data('track', track);
                    $select.append($option);
                });

            });
        
    };

    function googlDriveTrackOKHandler(fileLoadManager) {

        let obj;

        obj = configurator(fileLoadManager);

        if (obj) {
            igv.browser.loadTrackList( [ obj ] );
        }

        function configurator(fileLoadManager) {
            let config;

            if (undefined === fileLoadManager.name) {
                config = undefined;
            } else if (undefined === fileLoadManager.dictionary) {
                config = undefined;
            } else {

                config =
                    {
                        name: fileLoadManager.name,
                        filename:fileLoadManager.name,

                        format: igv.inferFileFormat(fileLoadManager.name),

                        url: fileLoadManager.dictionary.data,
                        indexURL: fileLoadManager.dictionary.index
                    };

            }

            return config;
        }

    }

    app.TrackLoadController.prototype.getJSON = function (path) {

        if (path instanceof File) {

            return this.fileReader
                .readAsTextAsync(path)
                .then(function (result) {
                    return JSON.parse(result);
                });

        } else {
            return igv.xhr
                .loadJson(path)
                .then(function (result) {
                    return result;
                })
        }

    };

    return app;

})(app || {});