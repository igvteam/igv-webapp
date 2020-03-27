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
import {configureModal} from './utils.js';
import FileLoadWidget from './fileLoadWidget.js';
import FileLoadManager from './fileLoadManager.js';
import ModalTable from '../node_modules/data-modal/js/modalTable.js'
import EncodeTrackDatasource from "../node_modules/data-modal/js/encodeTrackDatasource.js"
import { encodeTrackDatasourceConfigurator } from '../node_modules/data-modal/js/encodeTrackDatasourceConfig.js'
import { encodeTrackDatasourceSignalConfigurator } from "../node_modules/data-modal/js/encodeTrackDatasourceSignalConfig.js"
import { encodeTrackDatasourceOtherConfigurator } from "../node_modules/data-modal/js/encodeTrackDatasourceOtherConfig.js"

import MultipleFileLoadController from "./multipleFileLoadController.js";
import {alertPanel} from "./main.js";

class TrackLoadController {

    constructor({browser, trackRegistryFile, $urlModal, encodeModaTables, $dropdownMenu, $genericTrackSelectModal, uberFileLoader}) {

        let urlConfig;

        this.browser = browser;
        this.trackRegistryFile = trackRegistryFile;
        this.trackRegistry = undefined;
        this.encodeModaTables = encodeModaTables;
        this.$dropdownMenu = $dropdownMenu;
        this.$modal = $genericTrackSelectModal;

        // URL
        urlConfig =
            {
                $widgetParent: $urlModal.find('.modal-body'),
                mode: 'url',
            };

        this.urlWidget = new FileLoadWidget(urlConfig, new FileLoadManager());
        configureModal(this.urlWidget, $urlModal, (fileLoadManager) => {
            uberFileLoader.ingestPaths( fileLoadManager.getPaths() );
            return true;
        });

        this.updateTrackMenus(browser.genome.id);

    }

    async getTrackRegistry() {

        if (this.trackRegistry) {
            return this.trackRegistry;
        } else if (this.trackRegistryFile) {

            let response = undefined;

            try {
                response = await fetch(this.trackRegistryFile);
            } catch (e) {
                console.error(e);
            }

            if (response) {
                return await response.json();
            } else {
                return undefined;
            }

        } else {
            return undefined;
        }

    }

    updateTrackMenus(genomeID) {

        (async (genomeID) => {

            const id_prefix = 'genome_specific_';

            const $divider = this.$dropdownMenu.find('#igv-app-annotations-section');

            const searchString = '[id^=' + id_prefix + ']';
            const $found = this.$dropdownMenu.find(searchString);
            $found.remove();


            this.trackRegistry = undefined;
            try {
                this.trackRegistry = await this.getTrackRegistry();
            } catch (e) {
                alertPanel.presentAlert(e.message);
            }

            if (undefined === this.trackRegistry) {
                const e = new Error("Error retrieving registry via getTrackRegistry function");
                alertPanel.presentAlert(e.message);
                throw e;
            }

            const paths = this.trackRegistry[genomeID];

            if (undefined === paths) {
                console.warn(`There are no tracks in the track registryy for genome ${ genomeID }`);
                return;
                // const e = new Error(`No tracks defined for genome ${ genomeID }`);
                // alertPanel.presentAlert(e.message);
                // throw e;
            }

            let responses = [];
            try {
                responses = await Promise.all( paths.map( path => fetch(path) ) )
            } catch (e) {
                alertPanel.presentAlert(e.message);
            }

            let jsons = [];
            try {
                jsons = await Promise.all( responses.map( response => response.json() ) )
            } catch (e) {
                alertPanel.presentAlert(e.message);
            }

            let buttonConfigurations = [];

            for (let json of jsons) {

                if ('ENCODE' === json.type) {

                    let i = 0;
                    for (let config of [ encodeTrackDatasourceSignalConfigurator(genomeID), encodeTrackDatasourceOtherConfigurator(json.genomeID) ]) {
                        this.encodeModaTables[ i++ ].setDatasource( new EncodeTrackDatasource(config) )
                    }

                    buttonConfigurations.push(json);

                } else if ('GTEX' === json.type) {

                    let info = undefined;
                    try {
                        info = await igv.GtexUtils.getTissueInfo(json.datasetId);
                    } catch (e) {
                        alertPanel.presentAlert(e.message);
                    }

                    if (info) {
                        json.tracks = info.tissueInfo.map(tissue => igv.GtexUtils.trackConfiguration(tissue));
                        buttonConfigurations.push(json);
                    }

                } else {
                    buttonConfigurations.push(json);
                }

            }

            let encodeConfiguration
            let configurations = []
            for (let config of buttonConfigurations) {
                if (config.type && 'ENCODE' === config.type) {
                    encodeConfiguration = config
                } else {
                    configurations.unshift(config)
                }
            }

            createDropdownButton($divider, 'ENCODE Other', id_prefix).on('click', () => this.encodeModaTables[ 1 ].$modal.modal('show'));
            createDropdownButton($divider, 'ENCODE Signals', id_prefix).on('click', () => this.encodeModaTables[ 0 ].$modal.modal('show'));

            for (let config of configurations) {

                const $button = createDropdownButton($divider, config.label, id_prefix)

                $button.on('click', () => {

                    let markup = '<div>' + config.label + '</div>'
                    if (config.description) {
                        markup += '<div>' + config.description + '</div>'
                    }

                    this.$modal.find('#igv-app-generic-track-select-modal-label').html(markup)

                    configureModalSelectList(this.browser, this.$modal, config.tracks)

                    this.$modal.modal('show')
                });

            }

        })(genomeID);

    };

}

const createDropdownButton = ($divider, buttonText, id_prefix) => {
    const $button = $('<button>', { class: 'dropdown-item', type: 'button' })
    $button.text(`${ buttonText } ...`)
    $button.attr('id', `${ id_prefix }${ buttonText.toLowerCase().split(' ').join('_') }`)
    $button.insertAfter($divider)
    return $button
}

function configureModalSelectList(browser, $modal, configurations) {

    let $select,
        $option;

    $modal.find('select').remove();

    $select = $('<select>', {class: 'form-control'});
    $modal.find('.form-group').append($select);

    $option = $('<option>', {text: 'Select...'});
    $select.append($option);

    $option.attr('selected', 'selected');
    $option.val(undefined);

    configurations.reduce(($accumulator, configuration) => {

        $option = $('<option>', {value: configuration.name, text: configuration.name});
        $select.append($option);

        $option.data('track', configuration);

        $accumulator.append($option);

        return $accumulator;
    }, $select);

    $select.on('change', () => {

        let $option = $select.find('option:selected');
        const value = $option.val();

        if ('' === value) {
            // do nothing
        } else {

            $option.removeAttr("selected");

            const configuration = $option.data('track');
            browser.loadTrack(configuration);
        }

        $modal.modal('hide');

    });

}

export const trackLoadControllerConfigurator = ({browser, trackRegistryFile, $googleDriveButton}) => {

    const multipleFileTrackConfig =
        {
            $modal: $('#igv-app-multiple-file-load-modal'),
            modalTitle: 'Track File Error',
            $localFileInput: $('#igv-app-dropdown-local-track-file-input'),
            $dropboxButton: $('#igv-app-dropdown-dropbox-track-file-button'),
            $googleDriveButton,
            configurationHandler: MultipleFileLoadController.trackConfigurator,
            jsonFileValidator: MultipleFileLoadController.trackJSONValidator,
            pathValidator: MultipleFileLoadController.trackPathValidator,
            fileLoadHandler: (configurations) => {
                browser.loadTrackList(configurations);
            }
        };

    const encodeSignalModalTableConfig =
        {
            id: "igv-app-encode-signal-modal",
            title: "ENCODE Signals",
            selectionStyle: 'multi',
            pageLength: 100,
            selectHandler: async trackConfigurations => await browser.loadTrackList( trackConfigurations )
        };

    const encodeOtherModalTableConfig =
        {
            id: "igv-app-encode-other-modal",
            title: "ENCODE Other",
            selectionStyle: 'multi',
            pageLength: 100,
            selectHandler: async trackConfigurations => await browser.loadTrackList( trackConfigurations )
        };

    return {
        browser,
        trackRegistryFile,
        $urlModal: $('#igv-app-track-from-url-modal'),
        encodeModaTables: [ new ModalTable(encodeSignalModalTableConfig), new ModalTable(encodeOtherModalTableConfig) ],
        $dropdownMenu: $('#igv-app-track-dropdown-menu'),
        $genericTrackSelectModal: $('#igv-app-generic-track-select-modal'),
        uberFileLoader: new MultipleFileLoadController(browser, multipleFileTrackConfig)
    }

};

export default TrackLoadController;
