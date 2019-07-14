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

import {configureModal} from './utils.js';
import FileLoadWidget from './fileLoadWidget.js';
import FileLoadManager from './fileLoadManager.js';
import EncodeDataSource from './encode.js';
import ModalTable from './modalTable.js';
import MultipleFileLoadController from "./multipleFileLoadController.js";

class TrackLoadController {

    constructor({browser, trackRegistryFile, $urlModal, $encodeModal, $dropdownMenu, $genericTrackSelectModal, uberFileLoader}) {

        let urlConfig;

        this.trackRegistryFile = trackRegistryFile;
        this.browser = browser;
        this.$modal = $genericTrackSelectModal;
        this.$dropdownMenu = $dropdownMenu;
        this.$encodeModal = $encodeModal;

        // URL
        urlConfig =
            {
                $widgetParent: $urlModal.find('.modal-body'),
                mode: 'url',
            };

        this.urlWidget = new FileLoadWidget(urlConfig, new FileLoadManager());
        configureModal(this.urlWidget, $urlModal, (fileLoadManager) => {
            uberFileLoader.ingestPaths(fileLoadManager.getPaths());
            return true;
        });

        this.updateTrackMenus(browser.genome.id);

    }

    async getTrackRegistry() {

        const self = this;

        if (this.trackRegistry) {
            return this.trackRegistry;
        } else if (this.trackRegistryFile) {

            let registry = undefined;

            try {
                registry = await igv.xhr.loadJson(this.trackRegistryFile);
            } catch (err) {
                console.error(error);
            }

            return registry;

        } else {
            return undefined;
        }

    }

    createEncodeTable() {

        const browser = this.browser;

        const columnFormat =
            [
                {title: 'Cell Type', width: '7%'},
                {title: 'Target', width: '8%'},
                {title: 'Assay Type', width: '20%'},
                {title: 'Output Type', width: '20%'},
                {title: 'Bio Rep', width: '5%'},
                {title: 'Tech Rep', width: '5%'},
                {title: 'Format', width: '5%'},
                {title: 'Experiment', width: '7%'},
                {title: 'Accession', width: '8%'},
                {title: 'Lab', width: '20%'}
            ];

        const encodeDatasource = new EncodeDataSource(columnFormat);

        const encodeTableConfig =
            {
                $modal: this.$encodeModal,
                $modalBody: this.$encodeModal.find('.modal-body'),
                $modalTopCloseButton: this.$encodeModal.find('.modal-header button:nth-child(1)'),
                $modalBottomCloseButton: this.$encodeModal.find('.modal-footer button:nth-child(1)'),
                $modalGoButton: this.$encodeModal.find('.modal-footer button:nth-child(2)'),
                datasource: encodeDatasource,
                browserHandler: (trackConfigurations) => {
                    browser.loadTrackList(trackConfigurations);
                }
            };

        return new ModalTable(encodeTableConfig);


    };

    async updateTrackMenus(genomeID) {

        const id_prefix = 'genome_specific_';

        const self = this;

        const $divider = self.$dropdownMenu.find('#igv-app-annotations-section');

        const searchString = '[id^=' + id_prefix + ']';
        const $found = self.$dropdownMenu.find(searchString);
        $found.remove();

        self.trackRegistry = await this.getTrackRegistry();

        if (undefined === self.trackRegistry) {
            console.log("Info -- No track registry file  (config.trackRegistryFile)");
            return;
        }

        const paths = self.trackRegistry[genomeID];

        if (undefined === paths) {
            console.log("No tracks defined for: " + genomeID);
            return;
        }

        let results = [];
        for (let path of paths) {

            try {
                const result = await igv.xhr.loadJson((path));
                results.push(result);
            } catch (err) {
                console.error(err);
            }

        }

        let configurations = [];

        for (let r of results) {

            if ('ENCODE' === r.type) {

                let encodeConfiguration = r;

                encodeConfiguration.encodeTable = self.createEncodeTable(encodeConfiguration.genomeID);

                try {
                    encodeConfiguration.data = await encodeConfiguration.encodeTable.loadData(encodeConfiguration.genomeID);
                    configurations.push(encodeConfiguration);
                } catch (err) {
                    console.error(err);
                }
            }

            else if ('GTEX' === r.type) {
                let gtexConfiguration = r;
                try {

                    // TESTING
                    // await igv.xhr.loadJson('http://www.nothingtoseehere.com', {});

                    const info = await igv.GtexUtils.getTissueInfo(gtexConfiguration.datasetId);
                    gtexConfiguration.tracks = info.tissueInfo.map((tissue) => {
                        return igv.GtexUtils.trackConfiguration(tissue)
                    });
                    configurations.push(gtexConfiguration);
                } catch (err) {
                    console.error(err);
                }
            }

            else {
                configurations.push(r);
            }

        }

        configurations = configurations.reverse()
        for (let config of configurations) {

            const $button = $('<button>', {class: 'dropdown-item', type: 'button'});
            const str = config.label + ' ...';
            $button.text(str);

            const id = id_prefix + config.label.toLowerCase().split(' ').join('_');
            $button.attr('id', id);

            $button.insertAfter($divider);

            $button.on('click', () => {
                let markup;

                markup = '<div>' + config.label + '</div>';
                if (config.description) {
                    markup += '<div>' + config.description + '</div>';
                }

                self.$modal.find('#igv-app-generic-track-select-modal-label').html(markup);

                if ('ENCODE' === config.type) {

                    config.encodeTable.buildTable(true);
                    config.encodeTable.config.$modal.modal('show');

                } else {

                    configureModalSelectList(self.$modal, config.tracks, config.label);
                    self.$modal.modal('show');
                }


            });

        }

    };


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

    return {
        browser,
        trackRegistryFile,
        $urlModal: $('#igv-app-track-from-url-modal'),
        $encodeModal: $('#igv-app-encode-modal'),
        $dropdownMenu: $('#igv-app-track-dropdown-menu'),
        $genericTrackSelectModal: $('#igv-app-generic-track-select-modal'),
        uberFileLoader: new MultipleFileLoadController(browser, multipleFileTrackConfig)
    }

};

function configureModalSelectList($modal, configurations, promiseTaskName) {

    let $select,
        $option;

    $modal.find('select').remove();

    $select = $('<select>', {class: 'form-control'});
    $modal.find('.form-group').append($select);

    $option = $('<option>', {text: 'Select...'});
    $select.append($option);

    $option.attr('selected', 'selected');
    $option.val(undefined);

    configurations
        .reduce(function ($accumulator, trackConfiguration) {

            $option = $('<option>', {value: trackConfiguration.name, text: trackConfiguration.name});
            $select.append($option);

            $option.data('track', trackConfiguration);

            $accumulator.append($option);

            return $accumulator;
        }, $select);

    $select.on('change', function (e) {
        let $option,
            trackConfiguration,
            value;

        $option = $(this).find('option:selected');
        value = $option.val();

        if ('' === value) {
            // do nothing
        } else {
            trackConfiguration = $option.data('track');
            $option.removeAttr("selected");

            igv.browser.loadTrack(trackConfiguration);

        }

        $modal.modal('hide');

    });

}

export default TrackLoadController;
