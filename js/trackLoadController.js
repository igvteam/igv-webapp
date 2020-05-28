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

import { Alert } from '../node_modules/igv-widgets/dist/igv-widgets.js';
import { GtexUtils } from '../node_modules/igv-utils/src/index.js';
import { EncodeDataSource } from '../node_modules/data-modal/js/index.js';

class TrackLoadController {

    constructor({ trackRegistryFile, $dropdownMenu, $genericTrackSelectModal }) {
        this.trackRegistryFile = trackRegistryFile;
        this.$dropdownMenu = $dropdownMenu;
        this.$genericTrackSelectModal = $genericTrackSelectModal;
    }

}

const updateTrackMenus = async (genomeID, encodeModalTable, { trackRegistryFile, $dropdownMenu, $genericTrackSelectModal }, fileLoader) => {

    const id_prefix = 'genome_specific_';

    const $divider = $dropdownMenu.find('#igv-app-annotations-section');

    const searchString = '[id^=' + id_prefix + ']';
    const $found = $dropdownMenu.find(searchString);
    $found.remove();

    const paths = await getPathsWithTrackRegistryFile(genomeID, trackRegistryFile);

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

            const datasource = new EncodeDataSource(json.genomeID);
            encodeModalTable.setDatasource(datasource)
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

    } // for (json)

    buttonConfigurations = buttonConfigurations.reverse();
    for (let buttonConfiguration of buttonConfigurations) {

        const $button = $('<button>', {class: 'dropdown-item', type: 'button'});
        const str = buttonConfiguration.label + ' ...';
        $button.text(str);

        const id = id_prefix + buttonConfiguration.label.toLowerCase().split(' ').join('_');
        $button.attr('id', id);

        $button.insertAfter($divider);

        $button.on('click', () => {

            if ('ENCODE' === buttonConfiguration.type) {
                encodeModalTable.$modal.modal('show');
            } else {

                let markup = '<div>' + buttonConfiguration.label + '</div>';

                if (buttonConfiguration.description) {
                    markup += '<div>' + buttonConfiguration.description + '</div>';
                }

                $genericTrackSelectModal.find('#igv-app-generic-track-select-modal-label').html(markup);

                configureModalSelectList($genericTrackSelectModal, buttonConfiguration.tracks, fileLoader);

                $genericTrackSelectModal.modal('show');

            }

        });

    } // for (buttonConfiguration)


};

const configureModalSelectList = ($selectModal, configurations, fileLoader) => {

    let $select,
        $option;

    $selectModal.find('select').remove();

    $select = $('<select>', {class: 'form-control'});
    $selectModal.find('.form-group').append($select);

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

            fileLoader(configuration)
        }

        $selectModal.modal('hide');

    });

}

const getPathsWithTrackRegistryFile = async (genomeID, trackRegistryFile) => {

    let response = undefined;
    try {
        response = await fetch(trackRegistryFile);
    } catch (e) {
        console.error(e);
    }

    let trackRegistry = undefined
    if (response) {
        trackRegistry = await response.json();
    } else {
        const e = new Error("Error retrieving registry via getPathsWithTrackRegistryFile()");
        Alert.presentAlert(e.message);
        throw e;
    }

    return trackRegistry[ genomeID ]

}

export { updateTrackMenus }
export default TrackLoadController;
