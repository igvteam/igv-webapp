import { Alert, GtexUtils, Utils, FileLoadManager, FileLoadWidget } from '../node_modules/igv-widgets/dist/igv-widgets.js';
import EncodeDataSource from '../node_modules/data-modal/js/encodeDataSource.js'

class BetterTrackLoadController {

    constructor({ browser, trackRegistryFile, trackLoadModal, trackFileLoad, encodeModalTable, dropdownMenu, selectModal }) {

        let fileLoadWidgetConfig =
            {
                widgetParent: trackLoadModal.querySelector('.modal-body'),
                dataTitle: undefined,
                indexTitle: undefined,
                mode: 'url',
                fileLoadManager: new FileLoadManager(),
                dataOnly: undefined,
                doURL: undefined
            };

        this.urlWidget = new FileLoadWidget(fileLoadWidgetConfig);

        Utils.configureModal(this.urlWidget, trackLoadModal, async fileLoadWidget => {
            await trackFileLoad.loadPaths(fileLoadWidget.retrievePaths());
            return true;
        });

        this.browser = browser;
        this.trackRegistryFile = trackRegistryFile;
        this.encodeModalTable = encodeModalTable;

        this.updateTrackMenus(browser, browser.genome.id, trackRegistryFile, dropdownMenu, selectModal);
    }

    updateTrackMenus(browser, genomeID, trackRegistryFile, dropdownMenu, selectModal) {

        (async (browser) => {

            const id_prefix = 'genome_specific_';

            const $dropdownMenu = $(dropdownMenu);

            const $found = $dropdownMenu.find(`[id^=${ id_prefix }`);
            $found.remove();


            this.trackRegistry = undefined;
            try {
                this.trackRegistry = await this.getTrackRegistry(trackRegistryFile);
            } catch (e) {
                Alert.presentAlert(e.message);
            }

            if (undefined === this.trackRegistry) {
                const e = new Error("Error retrieving registry via getTrackRegistry function");
                Alert.presentAlert(e.message);
                throw e;
            }

            const paths = this.trackRegistry[ genomeID ];

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

            const $divider = $dropdownMenu.find('.dropdown-divider');

            buttonConfigurations = buttonConfigurations.reverse();
            for (let config of buttonConfigurations) {

                const $button = $('<button>', { class:'dropdown-item', type:'button' });
                $button.text(`${ config.label}...`);
                $button.attr('id', `${ id_prefix }${ config.label.toLowerCase().split(' ').join('_') }`);

                $button.insertAfter($divider);

                $button.on('click', () => {

                    if ('ENCODE' === config.type) {

                        this.encodeModalTable.$modal.modal('show');

                    } else {

                        let markup = '<div>' + config.label + '</div>';

                        if (config.description) {
                            markup += '<div>' + config.description + '</div>';
                        }

                        const $modal = $(selectModal);

                        $modal.find('#igv-app-generic-track-select-modal-label').html(markup);

                        configureModalSelectList(browser, $modal, config.tracks);

                        $modal.modal('show');

                    }

                });

            }

        })(browser);

    };

    createEncodeTable(genomeID) {
        const datasource = new EncodeDataSource(genomeID);
        this.encodeModalTable.setDatasource(datasource)
    };

    async getTrackRegistry(trackRegistryFile) {

        let response = undefined;

        try {
            response = await fetch(trackRegistryFile);
        } catch (e) {
            console.error(e);
        }

        if (response) {
            return await response.json();
        } else {
            return undefined;
        }

    }

}

function configureModalSelectList(browser, $selectModal, configurations) {

    $selectModal.find('select').remove();

    const $select = $('<select>', { class: 'form-control' });
    $selectModal.find('.form-group').append($select);

    let $option;

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

        $selectModal.modal('hide');

    });

}

export default BetterTrackLoadController;
