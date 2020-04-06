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
import {FileLoadManager, FileLoadWidget, Utils} from '../node_modules/igv-widgets/dist/igv-widgets.js';
import {FileUtils} from '../node_modules/igv-utils/src/index.js';
import SessionFileLoad from "./sessionFileLoad.js";
import { googleEnabled } from "./main.js";

class SessionController {

    constructor({sessionLoadModal, sessionSaveModal, sessionFileLoad, JSONProvider}) {

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
        Utils.configureModal(this.urlWidget, sessionLoadModal, async fileLoadWidget => {
            await sessionFileLoad.loadPaths(fileLoadWidget.retrievePaths());
            return true;
        });

        // Configure save session modal
        configureSaveSessionModal(JSONProvider, sessionSaveModal);

    }

}

const input_default_value = 'juiceboxjs-session.json';

function configureSaveSessionModal(JSONProvider, sessionSaveModal) {

    let input = sessionSaveModal.querySelector('input');

    let okHandler = () => {

        const extensions = new Set(['json', 'xml']);

        let filename = input.value;

        if (undefined === filename || '' === filename) {
            filename = input.getAttribute('placeholder');
        } else if (false === extensions.has(FileUtils.getExtension(filename))) {
            filename = filename + '.json';
        }

        const json = JSONProvider();
        const jsonString = JSON.stringify(json, null, '\t');
        const data = URL.createObjectURL(new Blob([jsonString], {type: "application/octet-stream"}));

        igv.download(filename, data);

        $(sessionSaveModal).modal('hide');
    };

    const $ok = $(sessionSaveModal).find('.modal-footer button:nth-child(2)');
    $ok.on('click', okHandler);

    $(sessionSaveModal).on('show.bs.modal', (e) => {
        input.value = input_default_value;
    });

    input.addEventListener('keyup', e => {

        // enter key key-up
        if (13 === e.keyCode) {
            okHandler();
        }
    });

}

export const sessionControllerConfigurator = (browser) => {

    // Session File Load
    const sessionFileLoadConfig =
        {
            localFileInput: document.querySelector('#igv-app-dropdown-local-session-file-input'),
            dropboxButton: document.querySelector('#igv-app-dropdown-dropbox-session-file-button'),
            googleEnabled,
            googleDriveButton: document.querySelector('#igv-app-dropdown-google-drive-session-file-button'),
            loadHandler: async config => await browser.loadSession(config),
            igvxhr: igv.xhr,
            google: igv.google
        };

    // Session Controller
    return {
            sessionLoadModal: document.querySelector('#igv-app-session-from-url-modal'),
            sessionSaveModal: document.querySelector('#igv-app-session-save-modal'),
            sessionFileLoad: new SessionFileLoad(sessionFileLoadConfig),
            JSONProvider: () => browser.toJSON()()
        }

};

export default SessionController;
