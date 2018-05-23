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

    app.SessionModalController = function (browser, $modal) {
        var self = this,
            obj,
            classes,
            $dismiss,
            $ok;

        this.browser = browser;
        this.sessionLoadManager = new app.SessionLoadManager(this);

        classes = 'igv-file-load-widget-container' + ' ' + 'igv-app-modal-position';
        this.$container = $('<div>', { class: classes });
        $modal.find('.modal-body').append(this.$container);

        // local data/index
        obj =
            {
                dataTitle: 'Local data file',
                indexTitle: 'Local index file'
            };
        createInputContainer.call(this, this.$container, obj);

        // url data/index
        obj =
            {
                doURL: true,
                dataTitle: 'Data URL',
                indexTitle: 'Index URL'
            };
        createInputContainer.call(this, this.$container, obj);

        // error message container
        this.$error_message = $("<div>", { class:"igv-flw-error-message-container" });
        this.$container.append(this.$error_message);
        // error message
        this.$error_message.append($("<div>", { class:"igv-flw-error-message" }));
        // error dismiss button
        igv.attachDialogCloseHandlerWithParent(this.$error_message, function () {
            self.dismissErrorMessage();
        });
        this.dismissErrorMessage();

        // upper dismiss - x - button
        $dismiss = $modal.find('.modal-header button:nth-child(1)');
        $dismiss.on('click', function () {
            self.dismiss();
        });

        // lower dismiss - close - button
        $dismiss = $modal.find('.modal-footer button:nth-child(1)');
        $dismiss.on('click', function () {
            self.dismiss();
        });

        // ok - button
        $ok = $modal.find('.modal-footer button:nth-child(2)');
        $ok.on('click', function () {
            self.okHandler();
        });

    };

    app.SessionModalController.prototype.okHandler = function () {

        var sesson;

        sesson = this.sessionLoadManager.getConfiguration();
        if (sesson) {
            this.browser.loadSession(sesson);
        }

        this.dismiss();
    };

    app.SessionModalController.prototype.presentErrorMessage = function(message) {
        this.$error_message.find('.igv-flw-error-message').text(message);
        this.$error_message.show();
    };

    app.SessionModalController.prototype.dismissErrorMessage = function() {
        this.$error_message.hide();
        this.$error_message.find('.igv-flw-error-message').text('');
    };

    app.SessionModalController.prototype.present = function () {
        this.$container.show();
    };

    app.SessionModalController.prototype.dismiss = function () {
        this.dismissErrorMessage();
        this.$container.find('input').val(undefined);
        this.$container.find('.igv-flw-local-file-name-container').hide();
        this.sessionLoadManager.reset();
    };

    function createInputContainer($parent, config) {
        var $container,
            $input_data_row,
            $label;

        // container
        $container = $("<div>", { class:"igv-flw-input-container" });
        $parent.append($container);

        // data
        $input_data_row = $("<div>", { class:"igv-flw-input-row" });
        $container.append($input_data_row);
        // label
        $label = $("<div>", { class:"igv-flw-input-label" });
        $input_data_row.append($label);
        $label.text(config.dataTitle);

        if (true === config.doURL) {
            createURLContainer.call(this, $input_data_row);
        } else {
            createLocalFileContainer.call(this, $input_data_row, 'igv-app-session-modal-data-file');
        }

    }

    function createURLContainer($parent) {
        var self = this,
            $data_drop_target,
            $input;

        $input = $('<input>', { type:'text', placeholder:'Enter data URL' });
        $parent.append($input);

        $input.on('focus', function () {
            self.dismissErrorMessage();
        });

        $input.on('change', function (e) {
            self.sessionLoadManager.dictionary[ 'data' ] = $(this).val();
        });

        $data_drop_target = $("<div>", { class:"igv-flw-drag-drop-target" });
        $parent.append($data_drop_target);
        $data_drop_target.text('or drop URL');

        $parent
            .on('drag dragstart dragend dragover dragenter dragleave drop', function (e) {
                var data;
                e.preventDefault();
                e.stopPropagation();
                self.dismissErrorMessage();
            })
            .on('dragover dragenter', function (e) {
                $(this).addClass('igv-flw-input-row-hover-state');
            })
            .on('dragleave dragend drop', function (e) {
                $(this).removeClass('igv-flw-input-row-hover-state');
            })
            .on('drop', function (e) {
                if (false === self.sessionLoadManager.didDragFile(e.originalEvent.dataTransfer)) {
                    self.sessionLoadManager.ingestDataTransfer(e.originalEvent.dataTransfer);
                    $input.val(self.sessionLoadManager.dataName());
                }
            });

    }

    function createLocalFileContainer($parent, id) {
        var self = this,
            $file_chooser_container,
            $data_drop_target,
            $label,
            $input,
            $file_name;

        $file_chooser_container = $("<div>", { class:"igv-flw-file-chooser-container" });
        $parent.append($file_chooser_container);

        $label = $('<label>', { for:id });
        $file_chooser_container.append($label);
        $label.text('Choose file...');

        $input = $('<input>', { class:"igv-flw-file-chooser-input", id:id, name:id, type:'file' });
        $file_chooser_container.append($input);

        $data_drop_target = $("<div>", { class:"igv-flw-drag-drop-target" });
        $parent.append($data_drop_target);
        $data_drop_target.text('or drop file');

        $file_name = $("<div>", { class:"igv-flw-local-file-name-container" });
        $parent.append($file_name);

        $file_name.hide();

        $input.on('change', function (e) {

            self.dismissErrorMessage();

            self.sessionLoadManager.dictionary[ 'data' ] = e.target.files[ 0 ];
            $file_name.text(e.target.files[ 0 ].name);
            $file_name.attr('title', e.target.files[ 0 ].name);
            $file_name.show();
        });

        $parent
            .on('drag dragstart dragend dragover dragenter dragleave drop', function (e) {
                e.preventDefault();
                e.stopPropagation();
                self.dismissErrorMessage();
            })
            .on('dragover dragenter', function (e) {
                $(this).addClass('igv-flw-input-row-hover-state');
            })
            .on('dragleave dragend drop', function (e) {
                $(this).removeClass('igv-flw-input-row-hover-state');
            })
            .on('drop', function (e) {
                var str;
                if (true === self.sessionLoadManager.didDragFile(e.originalEvent.dataTransfer)) {
                    self.sessionLoadManager.ingestDataTransfer(e.originalEvent.dataTransfer);
                    str = self.sessionLoadManager.dataName();
                    $file_name.text(str);
                    $file_name.attr('title', str);
                    $file_name.show();

                }
            });

    }

    app.SessionLoadManager = function (sessionModalController) {
        this.sessionLoadManager = sessionModalController;
        this.dictionary = {};
    };

    app.SessionLoadManager.prototype.didDragFile = function (dataTransfer) {
        var files;

        files = dataTransfer.files;

        return (files && files.length > 0);
    };

    app.SessionLoadManager.prototype.ingestDataTransfer = function (dataTransfer) {
        var url,
            files;

        url = dataTransfer.getData('text/uri-list');
        files = dataTransfer.files;

        if (files && files.length > 0) {
            this.dictionary[ 'data' ] = files[ 0 ];
        } else if (url && '' !== url) {
            this.dictionary[ 'data' ] = url;
        }

    };

    app.SessionLoadManager.prototype.dataName = function () {
        return itemName(this.dictionary.data);
    };

    app.SessionLoadManager.prototype.reset = function () {
        this.dictionary = {};
    };

    app.SessionLoadManager.prototype.getConfiguration = function () {

        if (undefined === this.dictionary.data) {
            this.sessionLoadManager.presentErrorMessage('Error: No data file');
            return undefined;
        } else {
            return this.dictionary.data;
        }

    };

    function itemName (item) {
        return igv.isFilePath(item) ? item.name : item;
    }

    function isValidDataFileOrURL (fileOrURL) {
        var extension,
            success;

        extension = igv.getExtension({ url: fileOrURL });
        success = ('json' === extension || 'xml' === extension);

        return success;
    }

    return app;
})(app || {});