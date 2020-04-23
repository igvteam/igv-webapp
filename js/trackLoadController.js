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

import { Alert, FileLoadManager, FileLoadWidget, Utils } from '../node_modules/igv-widgets/dist/igv-widgets.js';
import { GtexUtils } from '../node_modules/igv-utils/src/index.js';
import { EncodeDataSource } from '../node_modules/data-modal/js/index.js';

class TrackLoadController {

    constructor({browser, trackRegistryFile, $urlModal, encodeModalTable, $dropdownMenu, $genericTrackSelectModal, multipleTrackFileLoad}) {

        this.browser = browser;
        this.trackRegistryFile = trackRegistryFile;
        this.trackRegistry = undefined;
        this.encodeModalTable = encodeModalTable;
        this.$dropdownMenu = $dropdownMenu;
        this.$modal = $genericTrackSelectModal;

        let config =
            {
                widgetParent: $urlModal.find('.modal-body').get(0),
                dataTitle: 'Track',
                indexTitle: 'Track Index',
                mode: 'url',
                fileLoadManager: new FileLoadManager(),
                dataOnly: false,
                doURL: true
            };

        this.urlWidget = new FileLoadWidget(config);

        Utils.configureModal(this.urlWidget, $urlModal.get(0), async fileLoadWidget => {
            const paths = fileLoadWidget.retrievePaths();
            await multipleTrackFileLoad.loadPaths( paths );
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

    createEncodeTable(genomeID) {
        const datasource = new EncodeDataSource(genomeID);
        this.encodeModalTable.setDatasource(datasource)
    };

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
                Alert.presentAlert(e.message);
            }

            if (undefined === this.trackRegistry) {
                const e = new Error("Error retrieving registry via getTrackRegistry function");
                Alert.presentAlert(e.message);
                throw e;
            }

            const paths = this.trackRegistry[genomeID];

            if (undefined === paths) {
                console.warn(`There are no tracks in the track registryy for genome ${ genomeID }`);
                return;
            }

            let responses = [];
            try {
                responses = await Promise.all( paths.map( path => fetch(path) ) )
            } catch (e) {
                Alert.presentAlert(e.message);
            }

            let jsons = [];
            try {
                jsons = await Promise.all( responses.map( response => response.json() ) )
            } catch (e) {
                Alert.presentAlert(e.message);
            }

            let buttonConfigurations = [];

            for (let json of jsons) {

                if ('ENCODE' === json.type) {

                    this.createEncodeTable(json.genomeID);
                    buttonConfigurations.push(json);

                } else if ('GTEX' === json.type) {

                    let info = undefined;
                    try {
                        info = await GtexUtils.getTissueInfo(json.datasetId);
                    } catch (e) {
                        Alert.presentAlert(e.message);
                    }

                    if (info) {
                        json.tracks = info.tissueInfo.map(tissue => GtexUtils.trackConfiguration(tissue));
                        buttonConfigurations.push(json);
                    }

                } else {
                    buttonConfigurations.push(json);
                }


            }

            buttonConfigurations = buttonConfigurations.reverse();
            for (let config of buttonConfigurations) {

                const $button = $('<button>', {class: 'dropdown-item', type: 'button'});
                const str = config.label + ' ...';
                $button.text(str);

                const id = id_prefix + config.label.toLowerCase().split(' ').join('_');
                $button.attr('id', id);

                $button.insertAfter($divider);

                $button.on('click', () => {

                    if ('ENCODE' === config.type) {

                        this.encodeModalTable.$modal.modal('show');

                    } else {

                        let markup = '<div>' + config.label + '</div>';

                        if (config.description) {
                            markup += '<div>' + config.description + '</div>';
                        }

                        this.$modal.find('#igv-app-generic-track-select-modal-label').html(markup);

                        configureModalSelectList(this.browser, this.$modal, config.tracks);

                        this.$modal.modal('show');

                    }

                });

            }

        })(genomeID);

    };


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

export default TrackLoadController;
