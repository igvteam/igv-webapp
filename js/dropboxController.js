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
        this.$modalBody = $modal.find('.modal-body');
    };

    app.DropboxController.prototype.configure = function (config) {

        let self = this,
            loaderConfig,
            $dismiss,
            $ok,
            dbConfig;

        dbConfig = {

            success: function(dbFiles) {
                let objs;

                objs = [];
                dbFiles.forEach(function (dbFile) {
                    let obj;

                    if (igv.hasKnownFileExtension({ url:dbFile.name })) {

                        obj =
                            {
                                url: dbFile.link,
                                name: dbFile.name
                            };

                        objs.push(obj);

                    }
                });

                if (objs.length > 0) {
                    igv.browser.loadTrackList( objs );
                }

            },

            // Optional. Called when the user closes the dialog without selecting a file
            // and does not include any parameters.
            cancel: function() {

            },

            // Optional. "preview" (default) is a preview link to the document for sharing,
            // "direct" is an expiring link to download the contents of the file. For more
            // information about link types, see Link types below.
            linkType: "preview", // or "direct"

            // Optional. A value of false (default) limits selection to a single file, while
            // true enables multiple file selection.
            multiselect: true,

            // Optional. This is a list of file extensions. If specified, the user will
            // only be able to select files with these extensions. You may also specify
            // file types, such as "video" or "images" in the list. For more information,
            // see File types below. By default, all extensions are allowed.
            // extensions: ['.pdf', '.doc', '.docx'],

            // Optional. A value of false (default) limits selection to files,
            // while true allows the user to select both folders and files.
            // You cannot specify `linkType: "direct"` when using `folderselect: true`.
            folderselect: false, // or true
        };

        loaderConfig =
            {
                hidden: false,
                embed: true,
                $widgetParent: this.$modalBody,
                mode: 'url',
                // mode: 'localFile'
            };

        this.loader = config.browser.createFileLoadWidget(loaderConfig);

        // upper dismiss - x - button
        $dismiss = this.$modalBody.find('.modal-header button:nth-child(1)');
        $dismiss.on('click', function () {
            self.loader.dismiss();
        });

        // lower dismiss - close - button
        $dismiss = this.$modalBody.find('.modal-footer button:nth-child(1)');
        $dismiss.on('click', function () {
            self.loader.dismiss();
        });

        // ok - button
        $ok = this.$modalBody.find('.modal-footer button:nth-child(2)');
        $ok.on('click', function () {
            self.loader.okHandler();
        });

        this.loader.customizeLayout(function ($parent) {

            $parent.css({ width: '100%' });
            $parent.find('input').hide();
            $parent.find('.igv-flw-drag-drop-target').hide();

            $parent.find('.igv-flw-input-label').each(function () {
                let $div;
                $div = $('<div>');
                $div.insertAfter( $(this) );
                $div.get(0).appendChild( Dropbox.createChooseButton(dbConfig) )
            });

        });







    };

    return app;
})(app || {});