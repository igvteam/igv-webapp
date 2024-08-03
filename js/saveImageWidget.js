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

function createSaveImageWidget({ browser, saveModal, imageType }) {

    const modalElement = saveModal._element

    const input_default_value = `igv-app.${imageType}`;

    const input = modalElement.querySelector('input');

    modalElement.addEventListener('show.bs.modal', () => input.value = input_default_value);

    modalElement.addEventListener('hidden.bs.modal', () => input.value = input_default_value);

    const okHandler = () => {

        let filename = input.value;

        if (undefined === filename || '' === filename) {
            filename = input.getAttribute('placeholder');
        } else if (!filename.endsWith(`.${imageType}`)) {
            filename = `${filename}.${imageType}`;
        }

        saveModal.hide()

        imageType === 'svg' ? browser.saveSVGtoFile( filename ) : browser.savePNGtoFile(filename);
    };

    // ok - button
    const ok = modalElement.querySelector('.modal-footer button:nth-child(2)');

    ok.addEventListener('click', okHandler);

    input.addEventListener('keyup', (e) => {
        if (13 === e.keyCode) {
            okHandler();
        }
    });

    // upper dismiss - x - button
    let dismiss = modalElement.querySelector('.modal-header button');
    dismiss.addEventListener('click', () => saveModal.hide());

    // lower dismiss - close - button
    dismiss = modalElement.querySelector('.modal-footer button:nth-child(1)');
    dismiss.addEventListener('click', () => saveModal.hide());

}

export { createSaveImageWidget }
