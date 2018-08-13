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

'use strict';

var app = (function (app) {
    app.DropboxController = function (browser, $modal, dataTitle) {
        this.browser = browser;
        this.$modal = $modal;
        this.dataTitle = dataTitle;
    };

    app.DropboxController.prototype.configure = function (config) {

        let self = this,
            widgetConfig;

        widgetConfig =
            {
                dataTitle: this.dataTitle,
                $widgetParent: this.$modal.find('.modal-body'),
                mode: 'localFile'
            };

        this.fileLoadWidget = new app.FileLoadWidget(widgetConfig, new app.FileLoadManager());

        this.fileLoadWidget.customizeLayout(function ($parent) {

            $parent.find('.igv-flw-file-chooser-container').hide();

            if (true === config.dataFileOnly) {
                makeButton.call(self, $parent.find('.igv-flw-input-label').first(), false);
                $parent.find('.igv-flw-input-row').last().hide();
            } else {
                $parent.find('.igv-flw-input-label').each(function (index) {
                    makeButton.call(self, $(this), (1 === index));
                });
            }

            function makeButton($e, isIndexFile) {
                let $div,
                    settings;

                // insert Dropbox button container
                $div = $('<div>');
                $div.insertAfter( $e );

                // create Dropbox button
                settings = dbButtonConfigurator(self.fileLoadWidget.fileLoadManager, $e.parent().find('.igv-flw-local-file-name-container'), isIndexFile);
                $div.get(0).appendChild( Dropbox.createChooseButton(settings) )
            }
        });

        app.utils.configureModal(this.fileLoadWidget, this.$modal, config.okHandler);

    };

    function dbButtonConfigurator(fileLoadManager, $trackNameLabel, isIndexFile) {
        let obj;

        obj =
            {

            success: function(dbFiles) {
                // Single file selection only
                $trackNameLabel.text(dbFiles[ 0 ].name);
                $trackNameLabel.show();
                fileLoadManager.inputHandler(dbFiles[ 0 ].link, isIndexFile);
            },

            cancel: function() { },

            linkType: "preview",
            multiselect: false,
            folderselect: false,
        };

        return obj;
    }

    return app;
})(app || {});