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
            urlConfig,
            localFileConfig,
            doOK;

        // Local File
        localFileConfig =
            {
                dataTitle: 'Genome',
                $widgetParent: config.$fileModal.find('.modal-body'),
                mode: 'localFile'
            };

        this.localFileWidget = new app.FileLoadWidget(localFileConfig, new app.FileLoadManager());

        doOK = function (fileLoadManager) {
            okHandler(self, fileLoadManager);
        };

        app.utils.configureModal(this.localFileWidget, config.$fileModal, doOK);


        // URL
        urlConfig =
            {
                dataTitle: 'Genome',
                $widgetParent: config.$urlModal.find('.modal-body'),
                mode: 'url'
            };

        this.urlWidget = new app.FileLoadWidget(urlConfig, new app.FileLoadManager());

        doOK = function (fileLoadManager) {
            okHandler(self, fileLoadManager);
        };

        app.utils.configureModal(this.urlWidget, config.$urlModal, doOK);


        // Dropbox
        this.dropboxController = new app.DropboxController(browser, config.$dropboxModal, 'Genome');

        doOK = function (fileLoadManager) {
            okHandler(self, fileLoadManager);
        };

        this.dropboxController.configure({ okHandler: doOK, dataFileOnly: false });


        // Google Drive
        this.googleDriveController = new app.GoogleDriveController(browser, config.$googleDriveModal, 'Genome');

        this.googleDriveController.configure(function (fileLoadManager) {
            okHandler(self, fileLoadManager);
        });

    };

    app.GenomeLoadController.prototype.getAppLaunchGenomes = function () {
        let path;

        path = 'https://s3.amazonaws.com/igv.org.genomes/genomes.json';

        return igv.xhr
            .loadJson(path, {})
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

    function okHandler(genomeLoadController, fileLoadManager) {

        if (isValidGenomeConfiguration(fileLoadManager)) {

            genomeLoadController
                .genomeConfiguration(fileLoadManager)
                .then(function (obj) {
                    let genome;
                    genome = Object.values(obj).pop();
                    app.utils.loadGenome(genome);
                });

        }

    }

    function isValidGenomeConfiguration(fileLoadManager) {

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
            $button;

        // discard all buttons preceeding the divider div
        $divider = config.$dropdown_menu.find('#igv-app-genome-dropdown-divider');
        $divider.prevAll().remove();

        for (let key in config.genomeDictionary) {

            if (config.genomeDictionary.hasOwnProperty(key)) {

                $button = createButton(key);

                // prepend buttons relative to divider
                $button.insertBefore( $divider );

                $button.on('click', function () {
                    var key;

                    key = $(this).text();

                    if (key !== config.browser.genome.id) {
                        app.utils.loadGenome(config.genomeDictionary[ key ]);
                    }

                });

            } // if (...)

        } // for (...)

        function createButton (title) {
            var $button;

            $button = $('<button>', { class:'dropdown-item', type:'button' });
            $button.text(title);

            return $button;
        }

    };

    return app;

})(app || {});
