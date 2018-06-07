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
    app.DropboxController = function ($modal) {
        this.$modal = $modal;
    };

    app.DropboxController.prototype.configure = function (config) {

        let self = this,
            loaderConfig,
            $dismiss,
            $ok;

        loaderConfig =
            {
                hidden: false,
                embed: true,
                $widgetParent: this.$modal.find('.modal-body'),
                // mode: 'url',
                mode: 'localFile'
            };

        this.loader = config.browser.createFileLoadWidget(loaderConfig);

        // upper dismiss - x - button
        $dismiss = this.$modal.find('.modal-header button:nth-child(1)');
        $dismiss.on('click', function () {
            self.loader.dismiss();
        });

        // lower dismiss - close - button
        $dismiss = this.$modal.find('.modal-footer button:nth-child(1)');
        $dismiss.on('click', function () {
            self.loader.dismiss();
        });

        // ok - button
        $ok = this.$modal.find('.modal-footer button:nth-child(2)');
        $ok.on('click', function () {
            self.loader.okHandler();
        });

        this.loader.customizeLayout(function ($parent) {

            $parent.css({ width: '100%' });
            $parent.find('.igv-flw-file-chooser-container').hide();
            $parent.find('.igv-flw-drag-drop-target').hide();

            $parent.find('.igv-flw-input-label').each(function (index) {
                let $div,
                    settings,
                    lut;

                // insert Dropbox button container
                $div = $('<div>');
                $div.insertAfter( $(this) );

                // create Dropbox button
                lut =
                    [
                      'data',
                      'index'
                    ];

                settings = dbButtonConfigurator.call(self, $(this).parent().find('.igv-flw-local-file-name-container'), lut[ index ]);
                $div.get(0).appendChild( Dropbox.createChooseButton(settings) )
            });

        });

    };

    function dbButtonConfigurator($trackNameLabel, key = undefined) {
        let self = this,
            obj;
        obj =
            {

            success: function(dbFiles) {

                dbFiles.forEach(function (dbFile) {

                    if (igv.hasKnownFileExtension({ url:dbFile.name })) {
                        $trackNameLabel.text(dbFile.name);
                        $trackNameLabel.show();
                        self.loader.fileLoadManager.dictionary[ key ] = dbFile.link;
                    }

                });

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