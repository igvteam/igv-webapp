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

import EncodeDataSource from '../node_modules/data-modal/js/encodeDataSource.js'
import ModalTable from '../node_modules/data-modal/js/modalTable.js'
import {alertPanel} from "./main.js";
import {configureModal} from './utils.js';
import FileLoadWidget from './fileLoadWidget.js';
import FileLoadManager from './fileLoadManager.js';
import * as app_google from "./app-google.js";
import MultipleFileLoadController from "./multipleFileLoadController.js";
import {DomUtils} from '../node_modules/igv-ui/dist/igv-ui.js';

class TrackLoadController {

    constructor({browser, trackRegistryFile, modal, encodeModalTable, dropdownMenu, genericTrackSelectModal, uberFileLoader, modalDismissHandler}) {

        let urlConfig;

        this.browser = browser;
        this.trackRegistryFile = trackRegistryFile;
        this.encodeModalTable = encodeModalTable;
        this.dropdownMenu = dropdownMenu;
        this.modal = genericTrackSelectModal;

        urlConfig =
            {
                widgetParent: modal.querySelector('.modal-body'),
                dataTitle: undefined,
                indexTitle: undefined,
                mode: 'url',
                fileLoadManager: new FileLoadManager(),
                dataOnly: undefined,
                doURL: undefined
            };

        this.urlWidget = new FileLoadWidget(urlConfig);
        configureModal(this.urlWidget, modal, (fileLoadWidget) => {
            uberFileLoader.ingestPaths( fileLoadWidget.retrievePaths() );
            return true;
        });

        this.modalDismissHandler = modalDismissHandler;

        this.updateTrackMenus(browser.genome.id);

    }

    updateTrackMenus(genomeID) {

        (async (genomeID) => {

            const id_prefix = 'genome_specific_';

            const divider = this.dropdownMenu.querySelector('#igv-app-annotations-section');

            const e = this.dropdownMenu.querySelector(`[id^=${ id_prefix }]`);
            if (e) {
                e.parentNode.removeChild(e);
            }

            if (undefined === this.trackRegistryFile) {
                const e = new Error("Error: Missing track registry file");
                alertPanel.presentAlert(e.message);
                throw e;
            }

            const trackRegistry = await getTrackRegistry(this.trackRegistryFile);

            if (trackRegistry) {

                const paths = trackRegistry[ genomeID ];

                if (undefined === paths) {
                    console.warn(`There are no tracks in the track registry for genome ${ genomeID }`);
                    return;
                }

                let responses = [];
                try {
                    responses = await Promise.all( paths.map( path => fetch(path) ) )
                } catch (e) {
                    alertPanel.presentAlert(e.message);
                }

                if (responses.length > 0) {

                    let jsons = [];
                    try {
                        jsons = await Promise.all( responses.map( response => response.json() ) )
                    } catch (e) {
                        alertPanel.presentAlert(e.message);
                    }

                    if (jsons.length > 0) {

                        let buttonConfigurations = [];

                        for (let json of jsons) {

                            if ('ENCODE' === json.type) {
                                const datasource = new EncodeDataSource(json.genomeID);
                                this.encodeModalTable.setDatasource(datasource);
                                buttonConfigurations.push(json);
                            } else if ('GTEX' === json.type) {
                                let info = undefined;
                                try {
                                    info = await igv.GtexUtils.getTissueInfo(json.datasetId);
                                } catch (e) {
                                    alertPanel.presentAlert(e.message);
                                } finally {
                                    if (info) {
                                        json.tracks = info.tissueInfo.map(tissue => igv.GtexUtils.trackConfiguration(tissue));
                                        buttonConfigurations.push(json);
                                    }
                                }
                            } else {
                                buttonConfigurations.push(json);
                            }

                        }

                        buttonConfigurations = buttonConfigurations.reverse();
                        for (let config of buttonConfigurations) {

                            const { label, type, description, tracks } = config;

                            const button = DomUtils.create('button', { class: 'dropdown-item' });
                            button.setAttribute('type', 'button');
                            button.id = id_prefix + label.toLowerCase().split(' ').join('_');

                            button.textContent = `${ label } ...`;

                            // $button.insertAfter($divider);
                            divider.parentNode.insertBefore(button, divider.nextSibling);

                            button.addEventListener('click', () => {

                            });

                            button.setAttribute('data-toggle', 'modal');

                            if ('ENCODE' === type) {
                                button.setAttribute('data-target', `#${ this.encodeModalTable.$modal.get(0).id }`);
                            } else {

                                button.setAttribute('data-target', `#${ this.modal.id }`);

                                button.addEventListener('click', () => {

                                    let markup = `<div>${ label }</div>`;

                                    if (description) {
                                        markup += `<div>${ description }</div>`;
                                    }

                                    this.modal.querySelector('#igv-app-generic-track-select-modal-label').innerHTML = markup;

                                    configureModalSelectList(this.browser, this.modal, tracks, this.modalDismissHandler);

                                });


                            }

                        }

                    }

                }

            }



        })(genomeID);

    };

}

const getTrackRegistry = async trackRegistryFile => {

    let response = undefined;

    try {
        response = await fetch(trackRegistryFile);
    } catch (e) {
        console.error(e);
        alertPanel.presentAlert(e.message);
    } finally {

        if (response) {
            let trackRegistry = undefined;
            try {
                trackRegistry = await response.json();
            } catch (e) {
                console.error(e);
                alertPanel.presentAlert(e.message);
            } finally {
                return trackRegistry;
            }

        } else {
            return undefined;
        }

    }


};

const configureModalSelectList = (browser, modal, configurations, modalDismissHandler) => {

    let select,
        option;

    const e = modal.querySelector('select');
    e.parentNode.removeChild(e);

    select = DomUtils.create('select', { class: 'form-control' });
    modal.querySelector('.form-group').appendChild(select);

    option = DomUtils.create('option');
    option.setAttribute('text', 'Select...');
    option.setAttribute('selected', 'selected');
    option.value = undefined;

    select.appendChild(option);

    configurations.forEach((configuration, key) => {

        const { name } = configuration;

        select[ key ] = new Option(name, name, false, false);

        select[ key ].setAttribute('data-track', JSON.stringify(configuration));


    });


    select.addEventListener('change', () => {

        let selectedOption = select.options[ select.selectedIndex ];
        const value = selectedOption.value;

        if ('' === value) {
            // do nothing
        } else {

            selectedOption.removeAttribute('selected');

            const configuration = JSON.parse(selectedOption.getAttribute('data-track'));
            browser.loadTrack(configuration);
        }

        modalDismissHandler();

    });

}

export const trackLoadControllerConfigurator = ({browser, trackRegistryFile, multipleFileLoadConfig, modalDismissHandler }) => {

    const encodeModalTableConfig =
        {
            id: "igv-app-encode-modal",
            title: "ENCODE",
            selectHandler: async trackConfigurations => {
                await browser.loadTrackList( trackConfigurations )
            }
        };

    return {
        browser,
        trackRegistryFile,
        modal: document.querySelector('#igv-app-track-from-url-modal'),
        encodeModalTable: new ModalTable(encodeModalTableConfig),
        dropdownMenu: document.querySelector('#igv-app-track-dropdown-menu'),
        genericTrackSelectModal: document.querySelector('#igv-app-generic-track-select-modal'),
        uberFileLoader: new MultipleFileLoadController(trackLoadMultipleFileLoadConfigurator(multipleFileLoadConfig)),
        modalDismissHandler
    }

};

const trackLoadMultipleFileLoadConfigurator = ({ browser, modal, localFileInput, dropboxButton, googleEnabled, googleDriveButton, modalPresentationHandler }) => {

    if (false === googleEnabled) {
        DomUtils.hide(googleDriveButton.parentElement);
    }

    return {
        browser,
        modal,
        modalTitle: 'Track File Error',
        localFileInput,
        multipleFileSelection: true,
        dropboxButton,
        googleDriveButton: googleEnabled ? googleDriveButton : undefined,
        googleFilePickerHandler: googleEnabled ? app_google.createFilePickerHandler() : undefined,
        configurationHandler: MultipleFileLoadController.trackConfigurator,
        jsonFileValidator: MultipleFileLoadController.trackJSONValidator,
        pathValidator: MultipleFileLoadController.trackPathValidator,
        fileLoadHandler: (configurations) => {
            browser.loadTrackList(configurations);
        },
        modalPresentationHandler
    }

};

export default TrackLoadController;
