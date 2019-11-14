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

import FileLoadWidget from "./fileLoadWidget.js";
import FileLoadManager from "./fileLoadManager.js";
import {configureModal, getExtension } from "./utils.js";

class SessionController {

    constructor ({ browser, $loadSessionModal, $saveButton, $saveSessionModal, uberFileLoader }) {

        let urlConfig =
            {
                dataTitle: 'Load Session',
                $widgetParent: $loadSessionModal.find('.modal-body'),
                mode: 'url',
                dataOnly: true
            };

        this.urlWidget = new FileLoadWidget(urlConfig, new FileLoadManager());

        // Configure load session modal
        configureModal(this.urlWidget, $loadSessionModal, (fileLoadManager) => {
            uberFileLoader.ingestPaths(fileLoadManager.getPaths());
            return true;
        });

        // Configure save session modal
        configureSaveSessionModal(browser, $saveButton, $saveSessionModal);

    }



}

const input_default_value = 'igv-app-session.json';

function configureSaveSessionModal(browser, $saveButton, $saveSessionModal){

    $saveButton.on('click', (e) => {
        $saveSessionModal.modal('show');
    });

    let $input = $saveSessionModal.find('input');

    $saveSessionModal.on('show.bs.modal', (e) => {
        $input.val(input_default_value);
    });

    $saveSessionModal.on('hidden.bs.modal', (e) => {
        $input.val(input_default_value);
    });

    let $ok = $saveSessionModal.find('.modal-footer button:nth-child(2)');

    let okHandler = () => {

        const extensions = new Set(['json', 'xml']);

        let filename = $input.val();

        if (undefined === filename || '' === filename) {

            filename = $input.attr('placeholder');
        } else if (false === extensions.has( getExtension( filename ) )) {

            filename = filename + '.json';
        }

        $saveSessionModal.modal('hide');

        const json = browser.toJSON();
        const jsonString = JSON.stringify(json, null, '\t');
        const data = URL.createObjectURL(new Blob([ jsonString ], { type: "application/octet-stream" }));

        igv.download(filename, data);

    };

    $ok.on('click', okHandler);

    $input.on('keyup', (e) => {
        if (13 === e.keyCode) {
            okHandler();
        }
    });

    // upper dismiss - x - button
    let $dismiss = $saveSessionModal.find('.modal-header button:nth-child(1)');
    $dismiss.on('click', function () {
        $saveSessionModal.modal('hide');
    });

    // lower dismiss - close - button
    $dismiss = $saveSessionModal.find('.modal-footer button:nth-child(1)');
    $dismiss.on('click', function () {
        $saveSessionModal.modal('hide');
    });

}

export default SessionController;
