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


function createSVGWidget ({ browser, $saveModal }) {

    const input_default_value = 'igv-app.svg';

    let $input = $saveModal.find('input');

    $saveModal.on('show.bs.modal', (e) => {
        $input.val(input_default_value);
    });

    $saveModal.on('hidden.bs.modal', (e) => {
        $input.val(input_default_value);
    });

    let okHandler = () => {

        let fn = $input.val();

        const extensions = new Set(['svg']);

        if (undefined === fn || '' === fn) {

            fn = $input.attr('placeholder');
        } else if (false === extensions.has( igv.getExtension({ url: fn } ) )) {

            fn = fn + '.svg';
        }

        // dismiss modal
        $saveModal.modal('hide');

        browser.saveSVGtoFile({ filename: fn });
    };

    // ok - button
    let $ok = $saveModal.find('.modal-footer button:nth-child(2)');

    $ok.on('click', okHandler);

    $input.on('keyup', (e) => {
        if (13 === e.keyCode) {
            okHandler();
        }
    });

    // upper dismiss - x - button
    let $dismiss = $saveModal.find('.modal-header button:nth-child(1)');
    $dismiss.on('click', function () {
        $saveModal.modal('hide');
    });

    // lower dismiss - close - button
    $dismiss = $saveModal.find('.modal-footer button:nth-child(1)');
    $dismiss.on('click', function () {
        $saveModal.modal('hide');
    });

}

export { createSVGWidget }
