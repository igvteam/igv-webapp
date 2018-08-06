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
var app = (function (app) {

    app.TrackLoadController = function (browser, config) {

        var urlConfig;

        this.browser = browser;
        this.config = config;
        this.$modal = config.$genericTrackSelectModal;
        this.$dropdownMenu = config.$dropdownMenu;

        // URL
        urlConfig =
            {
                $widgetParent: config.$urlModal.find('.modal-body'),
                mode: 'url',
            };

        this.urlWidget = new app.FileLoadWidget(urlConfig, new app.FileLoadManager());
        app.utils.configureModal(this.urlWidget, config.$urlModal);

        this.updateGeneralizedAnnotations(browser.genome.id);

        // ENCODE
        this.createEncodeTable(browser.genome.id);

    };

    app.TrackLoadController.prototype.hideEncodeDropdownButton = function () {
        this.encodeTable.hidePresentationButton();
    };

    app.TrackLoadController.prototype.createEncodeTable = function (genomeID) {

        var self = this,
            columnFormat,
            encodeDatasource,
            loadTracks,
            encodeTableConfig;

        this.encodeTable = undefined;

        columnFormat =
            [
                {   'Cell Type': '10%' },
                {      'Target': '10%' },
                {  'Assay Type': '10%' },
                { 'Output Type': '20%' },
                {     'Bio Rep': '5%' },
                {    'Tech Rep': '5%'  },
                {      'Format': '5%'  },
                {    'Experiment' : '10%'},
                {         'Lab': '20%' }

            ];

        encodeDatasource = new app.EncodeDataSource(columnFormat);

        loadTracks = function (configurationList) {
            self.browser.loadTrackList(configurationList);
        };

        encodeTableConfig =
            {
                $modal:this.config.$encodeModal,
                $modalBody:this.config.$encodeModal.find('.modal-body'),
                $modalTopCloseButton: this.config.$encodeModal.find('.modal-header button:nth-child(1)'),
                $modalBottomCloseButton: this.config.$encodeModal.find('.modal-footer button:nth-child(1)'),
                $modalGoButton: this.config.$encodeModal.find('.modal-footer button:nth-child(2)'),
                $modalPresentationButton : this.config.$encodeModalPresentationButton,
                datasource: encodeDatasource,
                browserHandler: loadTracks,
                willRetrieveData: function () {
                    self.config.$encodeModalPresentationButton.addClass('igv-app-disabled');
                    self.config.$encodeModalPresentationButton.text('Configuring ENCODE table...');
                },
                didRetrieveData: function () {
                    self.config.$encodeModalPresentationButton.removeClass('igv-app-disabled');
                    self.config.$encodeModalPresentationButton.text('ENCODE ...');
                }
            };

        this.encodeTable = new app.ModalTable(encodeTableConfig);

        this.encodeTable.loadData(genomeID);

    };

    let gtex_lut;
    gtex_lut =
        {
            hg19: 'gtex_v7',
            // hg38: 'gtex_v78'
        };

    app.TrackLoadController.prototype.updateGeneralizedAnnotations = function (genomeID) {

        const id_prefix = 'genome_specific_';

        let self = this,
            root,
            tracks,
            searchString,
            $divider,
            $found;

        $divider = self.$dropdownMenu.find('#igv-app-annotations-section');

        searchString = '[id^=' + id_prefix + ']';
        $found = self.$dropdownMenu.find(searchString);
        $found.remove();

        root = 'resources/tracks';
        tracks = root + '/' + genomeID + '_' + 'tracks.txt';

        igv.xhr
            .loadString(tracks)
            .then((result) => {
                let paths,
                    promiseTasks,
                    gTexPromiseTask,
                    filenames;

                paths = result.split('\n').filter((part) => ( !('' === part) ));
                filenames = paths.map((path) => (path.split('.').shift()));

                promiseTasks = paths.map((path, i) => ({ name: filenames[ i ], promise: igv.xhr.loadJson(( root + '/' + path)) }));

                if (gtex_lut[ genomeID ]) {
                    gTexPromiseTask = { name: 'GTex', promise: igv.GtexUtils.getTissueInfo(gtex_lut[ genomeID ])};
                    promiseTasks.push(gTexPromiseTask);
                }

                Promise
                    .all( promiseTasks.map((task) => (task.promise)))
                    .then((json) => {
                        let menuItemConfigurations,
                            desiredMenuListOrder,
                            popped;

                        // hack to include GTex
                        menuItemConfigurations = json.map((m) => {
                            let revised;

                            revised = m;

                            if (revised[ 'tissueInfo' ]) {
                                Object.defineProperty(revised, 'tracks',
                                    Object.getOwnPropertyDescriptor(revised, 'tissueInfo'));
                                delete revised[ 'tissueInfo' ];
                            }

                            if (undefined === revised[ 'label' ]) {
                                revised[ 'label' ] = 'GTex';
                            }

                            return revised;
                        });

                        // remove last item in list (GTex)
                        popped = menuItemConfigurations.pop();

                        // reverse the list
                        desiredMenuListOrder = menuItemConfigurations.reverse();

                        // append GTex item
                        desiredMenuListOrder.push(popped);

                        desiredMenuListOrder
                            .forEach((config, i) => {
                                let $button,
                                    id,
                                    str;

                                $button = $('<button>', { class:'dropdown-item', type:'button' });
                                str = config.label + ' ...';
                                $button.text(str);

                                id = id_prefix + config.label.toLowerCase().split(' ').join('_');
                                $button.attr('id', id);

                                $button.insertAfter($divider);

                                $button.on('click', function () {
                                    let label;

                                    label = 'Load Track: ' + config.label;
                                    self.$modal.find('#igv-app-generic-track-select-modal-label').text(label);

                                    configureModalSelectList(self.$modal, config.tracks, promiseTasks[i].name);

                                    self.$modal.modal('show');
                                });
                            });

                    })

            })
            .catch((error) => {
                console.log('ERROR ' + error.message)
            });

    };

    function trackConfigurationFromGTexTissueInfo(tissueInfo) {

        return {
            type: "eqtl",
            sourceType: "gtex-ws",
            url: "https://gtexportal.org/rest/v1/association/singleTissueEqtlByLocationDev",
            tissueName: tissueInfo.tissueId,
            name: tissueInfo.tissueName,
            visibilityWindow: 1000000
        }

    }

    function configureModalSelectList($modal, configurations, promiseTaskName) {

        let $select,
            $option;

        $modal.find('select').remove();

        $select = $('<select>', { class:'custom-select form-control' });
        $modal.find('.form-group').append($select);

        $option = $('<option>', { text:'Choose one of the following...' });
        $select.append($option);

        $option.attr('selected','selected');
        $option.val(undefined);

        configurations
            .reduce(function($accumulator, config) {
                let trackConfiguration;

                // hack to support GTex
                trackConfiguration = ('GTex' === promiseTaskName) ? trackConfigurationFromGTexTissueInfo(config) : config;

                $option = $('<option>', { value:trackConfiguration.name, text:trackConfiguration.name });
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

                igv.browser.loadTrack( trackConfiguration );

            }

            $modal.modal('hide');

        });

    }

    return app;

})(app || {});