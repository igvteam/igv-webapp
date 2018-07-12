/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2016-2017 The Regents of the University of California
 * Author: Jim Robinson
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * Created by dat on 5/8/18.
 */
var app = (function (app) {
    app.GenomeLoadController = function (browser, config) {

        let self = this,
            urlLoaderConfig,
            locaFileLoaderConfig,
            doOK;

        // Local File
        locaFileLoaderConfig =
            {
                dataTitle: 'Genome',
                $widgetParent: config.$fileModal.find('.modal-body'),
                mode: 'localFile'
            };

        this.localFileLoader = new app.FileLoadWidget(locaFileLoaderConfig, new app.FileLoadManager());

        doOK = function () {
            okHandler(self, self.localFileLoader, config.$fileModal);
        };

        app.utils.configureModal(this.localFileLoader, config.$fileModal, doOK);


        // URL
        urlLoaderConfig =
            {
                dataTitle: 'Genome',
                $widgetParent: config.$urlModal.find('.modal-body'),
                mode: 'url'
            };

        this.urlLoader = new app.FileLoadWidget(urlLoaderConfig, new app.FileLoadManager());

        doOK = function () {
            okHandler(self, self.urlLoader, config.$urlModal);
        };

        app.utils.configureModal(this.urlLoader, config.$urlModal, doOK);


        // Dropbox
        this.dropboxController = new app.DropboxController(browser, config.$dropboxModal, 'Genome');

        doOK = function (loader, $modal) {
            okHandler(self, loader, $modal);
        };

        this.dropboxController.configure(doOK);


        // Google Drive
        this.googleDriveController = new app.GoogleDriveController(browser, config.$googleDriveModal, 'Genome');


        doOK = function (loader, $modal) {
            okHandler(self, loader, $modal);
        };

        this.googleDriveController.configure(function (obj, $filenameContainer, isIndexFile) {

            // update file name label
            $filenameContainer.text(obj.name);
            $filenameContainer.show();

            if (false === isIndexFile) {
                self.googleDriveController.loader.fileLoadManager.googlePickerFilename = obj.name;
            }

            self.googleDriveController.loader.fileLoadManager.inputHandler(obj.path, isIndexFile);

            self.googleDriveController.$modal.modal('show');

        }, doOK);

    };

    app.GenomeLoadController.prototype.getAppLaunchGenomes = function () {
        let path;

        path = 'https://s3.amazonaws.com/igv.org.genomes/genomes.json';
        return this.getGenomes(path);
    };

    app.GenomeLoadController.prototype.genomeConfiguration = function (fileLoadManager) {

        let self = this,
            obj;

        if (true === app.utils.isJSON(fileLoadManager.dictionary.data)) {
            obj = {};
            obj[ 'noname' ] = fileLoadManager.dictionary.data;

            return Promise.resolve(obj);

        } else {

            obj = {};
            obj[ 'noname' ] =
                {
                    fastaURL: fileLoadManager.dictionary.data,
                    indexURL: fileLoadManager.dictionary.index
                };

            return Promise.resolve(obj);
        }

    };

    app.GenomeLoadController.prototype.getGenomes = function (url) {

        return igv.xhr
            .loadJson(url, {})
            .then(function (result) {
                let dictionary;

                dictionary = {};
                if (true === Array.isArray(result)) {
                    result.forEach(function (json) {
                        dictionary[ json.id ] = json;
                    });
                } else {
                    dictionary[ result.id ] = result;
                }

                return dictionary;
            });

    };

    function okHandler(genomeLoadController, fileLoadWidget, $modal) {

        if (isValidFileLoadManagerDictionary(fileLoadWidget.fileLoadManager)) {

            genomeLoadController
                .genomeConfiguration(fileLoadWidget.fileLoadManager)
                .then(function (obj) {
                    let genome;
                    genome = Object.values(obj).pop();
                    app.utils.loadGenome(genome);
                });

        }

        fileLoadWidget.dismiss();
        $modal.modal('hide');

    }

    function isValidFileLoadManagerDictionary(fileLoadManager) {

        let success = true;

        if (undefined === fileLoadManager.dictionary) {

            success = false;
        } else if (undefined === fileLoadManager.dictionary.data) {

            success = false;
        } else if (undefined === fileLoadManager.dictionary.data && undefined === fileLoadManager.dictionary.index) {

            success = false;
        }

        return success;

    }

    app.genomeDropdownLayout = function (config) {

        var $divider,
            $button,
            keys;

        config.$dropdown_menu.empty();

        keys = Object.keys(config.genomeDictionary);

        keys.forEach(function (jsonID) {

            $button = createButton(jsonID);
            config.$dropdown_menu.append($button);

            $button.on('click', function () {
                var key;

                key = $(this).text();

                if (key !== config.browser.genome.id) {
                    app.utils.loadGenome(config.genomeDictionary[ key ]);
                }

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
    };

    return app;

})(app || {});
