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

class FileLoadWidget {

    constructor({ widgetParent, dataTitle, indexTitle, mode, fileLoadManager, dataOnly, doURL }) {

        dataTitle = dataTitle || 'Data';

        indexTitle = indexTitle || 'Index';

        this.fileLoadManager = fileLoadManager;
        this.fileLoadManager.fileLoadWidget = this;

        dataOnly = dataOnly || false;

        // TODO: Remove?
        doURL = doURL || false;

        // file load widget
        this.container = document.createElement('div');
        this.container.classList.add('igv-file-load-widget-container');
        widgetParent.appendChild(this.container);

        let config;
        if ('localFile' === mode) {
            // local data/index
            config =
                {
                    parent: this.container,
                    doURL: false,
                    dataTitle: dataTitle + ' file',
                    indexTitle: indexTitle + ' file',
                    dataOnly
                };
        } else {

            // url data/index
            config =
                {
                    parent: this.container,
                    doURL: true,
                    dataTitle: dataTitle + ' URL',
                    indexTitle: indexTitle + ' URL',
                    dataOnly
                };
        }

        this.createInputContainer(config);

        // const container = document.createElement('div');
        // container.classList.add('igv-flw-input-container');

        // error message container
        this.error_message = document.createElement('div');
        this.error_message.classList.add('igv-flw-error-message-container');
        this.container.appendChild(this.error_message);

        // error message
        const e = document.createElement('div');
        e.classList.add('igv-flw-error-message');
        this.error_message.appendChild(e);

        // error dismiss button
        attachCloseHandler(this.error_message, () => {
            this.dismissErrorMessage();
        });

        this.dismissErrorMessage();

    }

    presentErrorMessage(message) {
        this.error_message.querySelector('.igv-flw-error-message').textContent = message;
        this.error_message.style.display = 'block';
    }

    dismissErrorMessage() {
        this.error_message.style.display = 'none';
        this.error_message.querySelector('.igv-flw-error-message').textContent = '';
    }

    present() {
        this.container.style.display = 'block';
    }

    dismiss() {

        this.dismissErrorMessage();

        this.container.querySelector('input').value = undefined;
        const e = this.container.querySelector('.igv-flw-local-file-name-container');
        if (e) {
            e.style.display = 'none';
        }

        this.fileLoadManager.reset();

    }

    createInputContainer({ parent, doURL, dataTitle, indexTitle, dataOnly }) {

        // container
        const container = document.createElement('div');
        container.classList.add('igv-flw-input-container');
        parent.appendChild(container);

        // data
        const input_data_row = document.createElement('div');
        input_data_row.classList.add('igv-flw-input-row');
        container.appendChild(input_data_row);

        let label;

        // label
        label = document.createElement('div');
        label.classList.add('igv-flw-input-label');
        input_data_row.appendChild(label);
        label.textContent = dataTitle;

        if (true === doURL) {
            this.createURLContainer(input_data_row, 'igv-flw-data-url', false);
        } else {
            this.createLocalFileContainer(input_data_row, 'igv-flw-local-data-file', false);
        }

        if (true === dataOnly) {
            return;
        }

        // index
        const input_index_row = document.createElement('div');
        input_index_row.classList.add('igv-flw-input-row');
        container.appendChild(input_index_row);

        // label
        label = document.createElement('div');
        label.classList.add('igv-flw-input-label');
        input_index_row.appendChild(label);
        label.textContent = indexTitle;

        if (true === doURL) {
            this.createURLContainer(input_index_row, 'igv-flw-index-url', true);
        } else {
            this.createLocalFileContainer(input_index_row, 'igv-flw-local-index-file', true);
        }

    }

    createURLContainer(parent, id, isIndexFile) {

        const input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.setAttribute('placeholder', (true === isIndexFile ? 'Enter index URL' : 'Enter data URL'));
        parent.appendChild(input);

        if (isIndexFile) {
            this.inputIndex = input;
        } else {
            this.inputData = input;
        }

        // TODO: TBD - drag and drop for non-jquery
        // $parent
        //     .on('drag dragstart dragend dragover dragenter dragleave drop', function (e) {
        //         e.preventDefault();
        //         e.stopPropagation();
        //         self.dismissErrorMessage();
        //     })
        //     .on('dragover dragenter', function (e) {
        //         $(this).addClass('igv-flw-input-row-hover-state');
        //     })
        //     .on('dragleave dragend drop', function (e) {
        //         $(this).removeClass('igv-flw-input-row-hover-state');
        //     })
        //     .on('drop', function (e) {
        //         if (false === self.fileLoadManager.didDragDrop(e.originalEvent.dataTransfer)) {
        //
        //             self.fileLoadManager.dragDropHandler(e.originalEvent.dataTransfer, isIndexFile);
        //
        //             let value = isIndexFile ? self.fileLoadManager.indexName() : self.fileLoadManager.dataName();
        //             $input.val(value);
        //         }
        //     });

    }

    createLocalFileContainer(parent, id, isIndexFile) {

        const file_chooser_container = document.createElement('div');
        file_chooser_container.classList.add('igv-flw-file-chooser-container');
        parent.appendChild(file_chooser_container);

        const str = `${ id }${ igv.guid() }`;

        const label = document.createElement('label');
        label.setAttribute('for', str);
        file_chooser_container.appendChild(label);
        label.textContent = 'Choose file';

        const input = document.createElement('input');
        input.classList.add('igv-flw-file-chooser-input');
        input.setAttribute('id', str);
        input.setAttribute('name', str);
        input.setAttribute('type', 'file');
        file_chooser_container.appendChild(input);

        // TODO: TBD - hover for non-jquery
        // $file_chooser_container.hover(
        //     function() {
        //         $label.removeClass('igv-flw-label-color');
        //         $label.addClass('igv-flw-label-color-hover');
        //     }, function() {
        //         $label.removeClass('igv-flw-label-color-hover');
        //         $label.addClass('igv-flw-label-color');
        //     }
        // );

        const file_name = document.createElement('div');
        file_name.classList.add('igv-flw-local-file-name-container');
        parent.appendChild(file_name);

        file_name.style.display = "none";

        input.addEventListener('change', e => {

            this.dismissErrorMessage();

            this.fileLoadManager.inputHandler(e.target.files[ 0 ], isIndexFile);

            file_name.textContent = e.target.files[ 0 ].name;
            file_name.setAttribute('title', e.target.files[ 0 ].name);
            file_name.style.display = 'block';
        });


        // TODO: TBD - drag and drop for non-jquery
        // $parent
        //     .on('drag dragstart dragend dragover dragenter dragleave drop', function (e) {
        //         e.preventDefault();
        //         e.stopPropagation();
        //         self.dismissErrorMessage();
        //     })
        //     .on('dragover dragenter', function (e) {
        //         $(this).addClass('igv-flw-input-row-hover-state');
        //     })
        //     .on('dragleave dragend drop', function (e) {
        //         $(this).removeClass('igv-flw-input-row-hover-state');
        //     })
        //     .on('drop', function (e) {
        //         var str;
        //         if (true === self.fileLoadManager.didDragDrop(e.originalEvent.dataTransfer)) {
        //             self.fileLoadManager.dragDropHandler(e.originalEvent.dataTransfer, isIndexFile);
        //             str = isIndexFile ? self.fileLoadManager.indexName() : self.fileLoadManager.dataName();
        //             $file_name.text(str);
        //             $file_name.attr('title', str);
        //             $file_name.show();
        //
        //         }
        //     });

    }

}

const attachCloseHandler = (parent, closeHandler) => {

    const container = document.createElement('div');
    parent.appendChild(container);

    container.innerHTML = igv.iconMarkup('times');

    container.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        closeHandler()
    });

};

export default FileLoadWidget;
