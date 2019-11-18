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

import { DomUtils } from '../node_modules/igv-ui/dist/igv-ui.js';
class FileLoadWidget {

    constructor({ widgetParent, dataTitle, indexTitle, mode, fileLoadManager, dataOnly, doURL }) {

        dataTitle = dataTitle || 'Data';

        indexTitle = indexTitle || 'Index';

        this.fileLoadManager = fileLoadManager;

        dataOnly = dataOnly || false;

        // TODO: Remove?
        doURL = doURL || false;

        // file load widget
        this.container = DomUtils.div({ class: 'igv-file-load-widget-container'});
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

        // error message container
        this.error_message = DomUtils.div({ class: 'igv-flw-error-message-container'});
        this.container.appendChild(this.error_message);

        // error message
        this.error_message.appendChild(DomUtils.div({ class: 'igv-flw-error-message'}));

        // error dismiss button
        attachCloseHandler(this.error_message, () => {
            this.dismissErrorMessage();
        });

        this.dismissErrorMessage();

    }

    retrievePaths() {

        this.fileLoadManager.ingestPath(this.inputData.value, false);
        if (this.inputIndex) {
            this.fileLoadManager.ingestPath(this.inputIndex.value, true);
        }

        let paths = [];
        if (this.fileLoadManager.dictionary) {

            if (this.fileLoadManager.dictionary.data) {
                paths.push(this.fileLoadManager.dictionary.data);
            }
            if (this.fileLoadManager.dictionary.index) {
                paths.push(this.fileLoadManager.dictionary.index);
            }
        }

        return paths;

    }

    presentErrorMessage(message) {
        this.error_message.querySelector('.igv-flw-error-message').textContent = message;
        DomUtils.show(this.error_message);
    }

    dismissErrorMessage() {
        DomUtils.hide(this.error_message);
        this.error_message.querySelector('.igv-flw-error-message').textContent = '';
    }

    present() {
        DomUtils.show(this.container);
    }

    dismiss() {

        this.dismissErrorMessage();

        this.container.querySelector('input').value = undefined;
        const e = this.container.querySelector('.igv-flw-local-file-name-container');
        if (e) {
            DomUtils.hide(e);
        }

        this.fileLoadManager.reset();

    }

    createInputContainer({ parent, doURL, dataTitle, indexTitle, dataOnly }) {

        // container
        const container = DomUtils.div({ class: 'igv-flw-input-container' });
        parent.appendChild(container);

        // data
        const input_data_row = DomUtils.div({ class: 'igv-flw-input-row' });
        container.appendChild(input_data_row);

        let label;

        // label
        label = DomUtils.div({ class: 'igv-flw-input-label' });
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
        const input_index_row = DomUtils.div({ class: 'igv-flw-input-row' });
        container.appendChild(input_index_row);

        // label
        label = DomUtils.div({ class: 'igv-flw-input-label' });
        input_index_row.appendChild(label);
        label.textContent = indexTitle;

        if (true === doURL) {
            this.createURLContainer(input_index_row, 'igv-flw-index-url', true);
        } else {
            this.createLocalFileContainer(input_index_row, 'igv-flw-local-index-file', true);
        }

    }

    createURLContainer(parent, id, isIndexFile) {

        const input = DomUtils.create('input');
        input.setAttribute('type', 'text');
        input.setAttribute('placeholder', (true === isIndexFile ? 'Enter index URL' : 'Enter data URL'));
        parent.appendChild(input);

        if (isIndexFile) {
            this.inputIndex = input;
        } else {
            this.inputData = input;
        }

    }

    createLocalFileContainer(parent, id, isIndexFile) {

        const file_chooser_container = DomUtils.div({ class: 'igv-flw-file-chooser-container'});
        parent.appendChild(file_chooser_container);

        const str = `${ id }${ igv.guid() }`;

        const label = DomUtils.create('label');
        label.setAttribute('for', str);

        file_chooser_container.appendChild(label);
        label.textContent = 'Choose file';

        const input = DomUtils.create('input', { class: 'igv-flw-file-chooser-input'});
        input.setAttribute('id', str);
        input.setAttribute('name', str);
        input.setAttribute('type', 'file');
        file_chooser_container.appendChild(input);

        const file_name = DomUtils.div({ class: 'igv-flw-local-file-name-container' });
        parent.appendChild(file_name);

        DomUtils.hide(file_name);

        input.addEventListener('change', e => {

            this.dismissErrorMessage();

            const file = e.target.files[ 0 ];
            this.fileLoadManager.inputHandler(file, isIndexFile);

            const { name } = file;
            file_name.textContent = name;
            file_name.setAttribute('title', name);
            DomUtils.show(file_name);
        });

    }

}

const attachCloseHandler = (parent, closeHandler) => {

    const container = DomUtils.div();
    parent.appendChild(container);

    container.innerHTML = igv.iconMarkup('times');

    container.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        closeHandler()
    });

};

export default FileLoadWidget;
