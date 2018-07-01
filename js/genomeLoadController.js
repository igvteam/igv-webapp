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

        this.fileReader = new FileReader();
        app.utils.promisifyFileReader(this.fileReader);

        // Local File
        locaFileLoaderConfig =
            {
                dataTitle: 'Genome',
                hidden: false,
                embed: true,
                $widgetParent: config.$fileModal.find('.modal-body'),
                mode: 'localFile'
            };

        this.localFileLoader = browser.createFileLoadWidget(locaFileLoaderConfig, new igv.FileLoadManager());

        doOK = function () {
            okHandler(self.localFileLoader.fileLoadManager);
            self.localFileLoader.dismiss();
            config.$fileModal.modal('hide');
        };

        app.utils.configureModal(this.localFileLoader, config.$fileModal, doOK);


        // URL
        urlLoaderConfig =
            {
                dataTitle: 'Genome',
                hidden: false,
                embed: true,
                $widgetParent: config.$urlModal.find('.modal-body'),
                mode: 'url'
            };

        this.urlLoader = browser.createFileLoadWidget(urlLoaderConfig, new igv.FileLoadManager());

        doOK = function () {
            okHandler(self.urlLoader.fileLoadManager);
            self.urlLoader.dismiss();
            config.$urlModal.modal('hide');
        };

        app.utils.configureModal(this.urlLoader, config.$urlModal, doOK);


        // Dropbox
        this.dropboxController = new app.DropboxController(browser, config.$dropboxModal, 'Genome');

        doOK = function (loader, $modal) {
            okHandler(loader.fileLoadManager);
            loader.dismiss();
            $modal.modal('hide');
        };

        this.dropboxController.configure(doOK);


        // Google Drive
        this.googleDriveController = new app.GoogleDriveController(browser, config.$googleDriveModal, 'Genome');
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

            self.googleDriveController.loader.fileLoadManager.dictionary[key] = obj.path;

            self.googleDriveController.$modal.modal('show');

        }, okHandler);

    };

    app.GenomeLoadController.prototype.getAppLaunchGenomes = function () {
        let path;

        path = 'https://s3.amazonaws.com/igv.org.genomes/genomes.json';
        return this.getGenomes(path);
    };

    app.GenomeLoadController.prototype.getGenomes = function (url) {

        var dictionary;

        if (url instanceof File) {

            return this.fileReader
                .readAsTextAsync(url)
                .then(function (result) {
                    var json;

                    json = JSON.parse(result);
                    dictionary = {};
                    dictionary[ json.id ] = json;
                    return dictionary;
                });

        } else {
            return igv.xhr
                .loadJson(url, {})
                .then(function (result) {

                    dictionary = {};
                    if (true === Array.isArray(result)) {
                        result.forEach(function (json) {
                            dictionary[ json.id ] = json;
                        });
                    } else {
                        dictionary[ result.id ] = result;
                    }

                    return dictionary;
                })
        }

    };

    function okHandler (fileLoadManager) {
        let genomeObject,
            genome;

        genomeObject = getGenomeObject(fileLoadManager);
        genome = Object.values(genomeObject).pop();
        app.utils.loadGenome(genome);
    }

    function getGenomeObject (fileLoadManager) {
        let obj;

        obj = {};
        obj[ 'noname' ] =
            {
                fastaURL: fileLoadManager.dictionary.data,
                indexURL: (fileLoadManager.dictionary.index || undefined)
            };

        return obj;
    }

    app.genomeDropdownLayout = function (browser, config) {

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

                if (key !== browser.genome.id) {
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
