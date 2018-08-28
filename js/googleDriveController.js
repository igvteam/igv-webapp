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

import { configureModal } from './utils.js';
import * as google_utils from './google-utils.js';
import FileLoadWidget from './fileLoadWidget.js';
import FileLoadManager from './fileLoadManager.js';

class GoogleDriveController {

    constructor(browser, $modal, dataTitle) {
        this.browser = browser;
        this.$modal = $modal;
        this.dataTitle = dataTitle;
    }

    configurefunction (okHandler) {

        let self = this,
            widgetConfig;

        widgetConfig =
            {
                dataTitle: this.dataTitle,
                $widgetParent: this.$modal.find('.modal-body'),
                mode: 'localFile'
            };

        this.fileLoadWidget = new FileLoadWidget(widgetConfig, new FileLoadManager());

        this.fileLoadWidget.customizeLayout(function ($parent) {
            let $file_chooser_container;

            $file_chooser_container = $parent.find('.igv-flw-file-chooser-container');
            $file_chooser_container.each(function (index) {
                let $div,
                    $filenameContainer;

                $(this).empty();

                // widen button
                $(this).css({ width:'200px' });
                $div = $('<div>', { class: 'igv-app-modal-google-drive-logo' });
                $(this).append($div);

                $filenameContainer = $(this).parent().find('.igv-flw-local-file-name-container');

                $(this).on('click', function (e) {
                    self.$modal.modal('hide');
                    google_utils.createPicker(self.fileLoadWidget.fileLoadManager, self.$modal, $filenameContainer, (1 === index), filePickerHandler);
                });
            });

            $parent.find('.igv-flw-drag-drop-target').remove();

        });

        configureModal(this.fileLoadWidget, this.$modal, okHandler);


    }

}


function filePickerHandler(fileLoadManager, $modal, googlePickerResponse, $filenameContainer, isIndexFile) {

    // update file name label
    $filenameContainer.text(googlePickerResponse.name);
    $filenameContainer.show();

    if (false === isIndexFile) {
        fileLoadManager.googlePickerFilename = googlePickerResponse.name;
    }

    fileLoadManager.inputHandler(googlePickerResponse.path, isIndexFile);

    $modal.modal('show');

}

export default GoogleDriveController;
