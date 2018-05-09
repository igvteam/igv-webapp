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

    app.GenomeModalController = function (browser, $modal) {
        var self = this,
            obj,
            classes,
            $dismiss,
            $ok;

        this.browser = browser;
        this.genomeLoadManager = new app.GenomeLoadManager(this);

        classes = 'igv-file-load-widget-container' + ' ' + 'igv-app-genome-modal-position';
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

    app.GenomeModalController.prototype.okHandler = function () {

        var self = this,
            config;

        config = this.genomeLoadManager.getConfiguration();
        if (config) {
            self.browser
                .loadGenome(config)
                .then(function (genome) {

                    if (genome.id) {
                        app.trackLoadController.createEncodeTable(genome.id);
                    } else {
                        app.trackLoadController.encodeTable.hidePresentationButton();
                    }

                    self.dismiss();
                });
        }

        // this.dismiss();
    };

    // function genomeAssembly (genome) {
    //     var parts,
    //         assembly;
    //
    //     /*
    //     https://s3.amazonaws.com/igv.broadinstitute.org/genomes/seq/mm10/mm10.fa
    //     */
    //
    //     assembly = genome.config.fastaURL.split('/').pop().split('.').shift();
    //     return assembly;
    // }

    app.GenomeModalController.prototype.presentErrorMessage = function(message) {
        this.$error_message.find('.igv-flw-error-message').text(message);
        this.$error_message.show();
    };

    app.GenomeModalController.prototype.dismissErrorMessage = function() {
        this.$error_message.hide();
        this.$error_message.find('.igv-flw-error-message').text('');
    };

    app.GenomeModalController.prototype.present = function () {
        this.$container.show();
    };

    app.GenomeModalController.prototype.dismiss = function () {
        this.dismissErrorMessage();
        this.$container.find('input').val(undefined);
        this.$container.find('.igv-flw-local-file-name-container').hide();
        this.genomeLoadManager.reset();
    };

    function createInputContainer($parent, config) {
        var $container,
            $input_data_row,
            $input_index_row,
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
            createURLContainer.call(this, $input_data_row, 'igv-app-genome-modal-url', false);
        } else {
            createLocalFileContainer.call(this, $input_data_row, 'igv-app-genome-modal-data-file', false);
        }

        // index
        $input_index_row = $("<div>", { class:"igv-flw-input-row" });
        $container.append($input_index_row);
        // label
        $label = $("<div>", { class:"igv-flw-input-label" });
        $input_index_row.append($label);
        $label.text(config.indexTitle);

        if (true === config.doURL) {
            createURLContainer.call(this, $input_index_row, 'igv-app-genome-modal-index-url', true);
        } else {
            createLocalFileContainer.call(this, $input_index_row, 'igv-app-genome-modal-index-file', true);
        }

    }

    function createURLContainer($parent, id, isIndexFile) {
        var self = this,
            $data_drop_target,
            $input;

        $input = $('<input>', { type:'text', placeholder:(true === isIndexFile ? 'Enter index URL' : 'Enter data URL') });
        $parent.append($input);

        $input.on('focus', function () {
            self.dismissErrorMessage();
        });

        $input.on('change', function (e) {
            self.genomeLoadManager.dictionary[ true === isIndexFile ? 'index' : 'data' ] = $(this).val();
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
                if (false === self.genomeLoadManager.didDragFile(e.originalEvent.dataTransfer)) {
                    self.genomeLoadManager.ingestDataTransfer(e.originalEvent.dataTransfer, isIndexFile);
                    $input.val(isIndexFile ? self.genomeLoadManager.indexName() : self.genomeLoadManager.dataName());
                }
            });

    }

    function createLocalFileContainer($parent, id, isIndexFile) {
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

            self.genomeLoadManager.dictionary[ true === isIndexFile ? 'index' : 'data' ] = e.target.files[ 0 ];
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
                if (true === self.genomeLoadManager.didDragFile(e.originalEvent.dataTransfer)) {
                    self.genomeLoadManager.ingestDataTransfer(e.originalEvent.dataTransfer, isIndexFile);
                    str = isIndexFile ? self.genomeLoadManager.indexName() : self.genomeLoadManager.dataName();
                    $file_name.text(str);
                    $file_name.attr('title', str);
                    $file_name.show();

                }
            });

    }

    app.GenomeLoadManager = function (genomeModalController) {

        this.genomeModalController = genomeModalController;

        this.dictionary = {};

        this.keyToIndexExtension =
            {
                fa: { extension: 'fai', optional: true }
            };

        this.indexExtensionToKey = _.invert(_.mapObject(this.keyToIndexExtension, function (val) {
            return val.extension;
        }));
    };

    app.GenomeLoadManager.prototype.didDragFile = function (dataTransfer) {
        var files;

        files = dataTransfer.files;

        return (files && files.length > 0);
    };

    app.GenomeLoadManager.prototype.ingestDataTransfer = function (dataTransfer, isIndexFile) {
        var url,
            files;

        url = dataTransfer.getData('text/uri-list');
        files = dataTransfer.files;

        if (files && files.length > 0) {
            this.dictionary[ true === isIndexFile ? 'index' : 'data' ] = files[ 0 ];
        } else if (url && '' !== url) {
            this.dictionary[ true === isIndexFile ? 'index' : 'data' ] = url;
        }

    };

    app.GenomeLoadManager.prototype.indexName = function () {
        return itemName(this.dictionary.index);
    };

    app.GenomeLoadManager.prototype.dataName = function () {
        return itemName(this.dictionary.data);
    };

    app.GenomeLoadManager.prototype.reset = function () {
        this.dictionary = {};
    };

    app.GenomeLoadManager.prototype.getConfiguration = function () {
        var _isIndexFile;


        if (undefined === this.dictionary.data) {

            this.genomeModalController.presentErrorMessage('Error: No data file');
            return undefined;
        } else if (false === isValidDataFileOrURL.call(this, this.dictionary.data)) {

            this.genomeModalController.presentErrorMessage('Error: data file is invalid.');
            return undefined;
        } else {

            if (true === isValidIndexFileORURL.call(this, this.dictionary.data)) {

                this.genomeModalController.presentErrorMessage('Error: index file submitted as data file.');
                return undefined;
            } else {

                if (this.dictionary.index && false === isValidIndexFileORURL.call(this, this.dictionary.index)) {

                    this.genomeModalController.presentErrorMessage('Error: index file is not valid.');
                    return undefined;
                }

                return { fastaURL: this.dictionary.data, indexURL: (this.dictionary.index || undefined) };
            }

        }

    };

    function itemName (item) {
        return igv.isFilePath(item) ? item.name : item;
    }

    function isValidDataFileOrURL (fileOrURL) {
        var extension,
            success;

        extension = igv.getExtension({ url: fileOrURL });
        success = ('fasta' === extension || 'fa' === extension);
        return success;

    }

    function isValidIndexFileORURL(fileOrURL) {
        var extension,
            success;

        extension = igv.getExtension({ url: fileOrURL });
        success = ('fai' === extension);
        return success;
    }

    return app;
})(app || {});