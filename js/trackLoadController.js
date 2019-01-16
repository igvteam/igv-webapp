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

import igv from './igv.esm.min.js';
import {configureModal} from './utils.js';
import FileLoadWidget from './fileLoadWidget.js';
import FileLoadManager from './fileLoadManager.js';
import EncodeDataSource from './encodeDataSource.js';
import ModalTable from './modalTable.js';

class TrackLoadController {

    constructor(browser, {trackRegistryFile, $urlModal, $encodeModal, $dropdownMenu, $genericTrackSelectModal, uberFileLoader}) {

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

    getTrackRegistry() {

        const self = this;

        if (this.trackRegistry) {
            return Promise.resolve(this.trackRegistry);
        }
        else if (this.trackRegistryFile) {
            return igv.xhr.loadJson(this.trackRegistryFile)

                .then(function (registry) {
                    self.trackRegistry = registry;
                    return registry;
                })
                .catch(function (error) {
                    console.error(error);
                    return {};
                })
        } else {
            return {};
        }

    }

    createEncodeTable() {

        const browser = this.browser;

        const columnFormat =
            [
                {'Cell Type': '10%'},
                {'Target': '10%'},
                {'Assay Type': '10%'},
                {'Output Type': '20%'},
                {'Bio Rep': '5%'},
                {'Tech Rep': '5%'},
                {'Format': '5%'},
                {'Experiment': '10%'},
                {'Lab': '20%'}

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

    updateTrackMenus(genomeID) {

        const id_prefix = 'genome_specific_';

        const self = this;

        const $divider = self.$dropdownMenu.find('#igv-app-annotations-section');

        const searchString = '[id^=' + id_prefix + ']';
        const $found = self.$dropdownMenu.find(searchString);
        $found.remove();

        const root = 'resources/tracks';
        const trackRegistryFile = root + '/' + genomeID + '_' + 'tracks.txt';

        this.getTrackRegistry()

            .then(function (registry) {

                if (!registry) {
                    console.log("Info -- No track registry file  (config.trackRegistryFile)");
                    return;
                }

                const paths = registry[genomeID];

                if (!paths) {
                    console.log("No tracks defined for: " + genomeID);
                    return;
                }

                const promiseTasks = paths
                    .filter((path) => (!path.startsWith("@EXTRA")))
                    .map((path) => (igv.xhr.loadJson((path))))
                    .reverse();

                Promise

                    .all(promiseTasks)

                    .then((results) => {

                        Promise.all(getMenuConfigurations(results))

                            .then(function (menuItemConfigurations) {


                                menuItemConfigurations.forEach((config) => {

                                    const $button = $('<button>', {class: 'dropdown-item', type: 'button'});
                                    const str = config.label + ' ...';
                                    $button.text(str);

                                    const id = id_prefix + config.label.toLowerCase().split(' ').join('_');
                                    $button.attr('id', id);

                                    $button.insertAfter($divider);

                                    $button.on('click', function () {
                                        let markup;

                                        markup = '<div>' + config.label + '</div>';
                                        if (config.description) {
                                            markup += '<div>' + config.description + '</div>';
                                        }

                                        self.$modal.find('#igv-app-generic-track-select-modal-label').html(markup);

                                        if ('ENCODE' === config.type) {

                                            config.encodeTable.buildTableWithData(config.data);
                                            config.encodeTable.$modal.modal('show');

                                        } else {

                                            configureModalSelectList(self.$modal, config.tracks, config.label);
                                            self.$modal.modal('show');
                                        }


                                    });
                                });
                            });
                    })

            })
            .catch((error) => {
                console.log('ERROR ' + error.message)
            });

        function getMenuConfigurations(config) {

            return config.map((m) => {

                if ("ENCODE" === m.type) {

                    m.encodeTable = self.createEncodeTable(m.genomeID);

                    return m.encodeTable.promisifiedLoadData(genomeID)

                        .then(function (tableData) {
                            m.data = tableData;
                            return m;

                        });
                }

                else if ("GTEX" === m.type) {

                    return igv.GtexUtils.getTissueInfo(m.genomeID)

                        .then(function (info) {

                            m.tracks = info.tissueSummary.map((tissue) => {
                                return igv.GtexUtils.trackConfiguration(tissue)
                            });

                            return m;
                        });
                }

                else {
                    return Promise.resolve(m);
                }
            });
        }

    };


}


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
