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

import igv from '../node_modules/igv/dist/igv.esm.js';
import { GoogleFilePicker, Utils, FileUtils, MultipleFileLoadController, FileLoadManager, FileLoadWidget } from '../node_modules/igv-widgets/dist/igv-widgets.js';
import { DomUtils } from '../node_modules/igv-ui/dist/igv-ui.js';

class SessionController {

    constructor ({ browser, sessionLoadModal, sessionSaveModal, uberFileLoader }) {

        let config =
            {
                widgetParent: sessionLoadModal.querySelector('.modal-body'),
                dataTitle: 'Load Session',
                indexTitle: undefined,
                mode: 'url',
                fileLoadManager: new FileLoadManager(),
                dataOnly: true,
                doURL: undefined
            };

        this.urlWidget = new FileLoadWidget(config);

        // Configure load session modal
        Utils.configureModal(this.urlWidget, sessionLoadModal, (fileLoadWidget) => {
            uberFileLoader.ingestPaths(fileLoadWidget.retrievePaths());
            return true;
        });

        // Configure save session modal
        configureSaveSessionModal(browser, sessionSaveModal);

    }



}

const input_default_value = 'igv-app-session.json';

function configureSaveSessionModal(browser, sessionSaveModal){

    let input = sessionSaveModal.querySelector('input');

    let okHandler = () => {

        const extensions = new Set(['json', 'xml']);

        let filename = input.value;

        if (undefined === filename || '' === filename) {
            filename = input.getAttribute('placeholder');
        } else if (false === extensions.has( FileUtils.getExtension( filename ) )) {
            filename = filename + '.json';
        }

        const json = browser.toJSON();
        const jsonString = JSON.stringify(json, null, '\t');
        const data = URL.createObjectURL(new Blob([ jsonString ], { type: "application/octet-stream" }));

        igv.download(filename, data);

    };

    $(sessionSaveModal).on('show.bs.modal', (e) => {
        input.value = input_default_value;
    });

    $(sessionSaveModal).on('hidden.bs.modal', (e) => {
        okHandler();
    });

    input.addEventListener('keyup', e => {
        if (13 === e.keyCode) {
            $(sessionSaveModal).modal('hide');
        }
    });

}

export const sessionMultipleFileLoadConfigurator = ({ browser, modal, localFileInput, dropboxButton, googleEnabled, googleDriveButton, modalPresentationHandler }) => {

    if (false === googleEnabled) {
        DomUtils.hide(googleDriveButton.parentElement);
    }

    return {
        browser,
        modal,
        modalTitle: 'Session File Error',
        localFileInput,
        multipleFileSelection: false,
        dropboxButton,
        googleDriveButton: googleEnabled ? googleDriveButton : undefined,
        googleFilePickerHandler: googleEnabled ? GoogleFilePicker.createFilePickerHandler() : undefined,
        configurationHandler: MultipleFileLoadController.sessionConfigurator,
        jsonFileValidator: MultipleFileLoadController.sessionJSONValidator,
        pathValidator: undefined,
        fileLoadHandler: undefined,
        modalPresentationHandler
    }

};

export default SessionController;
