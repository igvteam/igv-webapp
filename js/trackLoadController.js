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

'use strict';

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

    };

    app.TrackLoadController.prototype.promisifiedCreateEncodeTable = function (genomeID) {

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

        encodeTableConfig =
            {
                $modal:this.config.$encodeModal,
                $modalBody:this.config.$encodeModal.find('.modal-body'),
                $modalTopCloseButton: this.config.$encodeModal.find('.modal-header button:nth-child(1)'),
                $modalBottomCloseButton: this.config.$encodeModal.find('.modal-footer button:nth-child(1)'),
                $modalGoButton: this.config.$encodeModal.find('.modal-footer button:nth-child(2)'),
                datasource: encodeDatasource,
                browserHandler: (trackConfigurations) =>  {
                    self.browser.loadTrackList(trackConfigurations);
                }
            };

        this.encodeTable = new app.ModalTable(encodeTableConfig);

        return this.encodeTable.promisifiedLoadData(genomeID);


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
                    promiseTasksReversed,
                    encodePromiseTask,
                    gTexPromiseTask,
                    filenames;

                paths = result.split('\n').filter((part) => ( !('' === part) ));
                filenames = paths.map((path) => (path.split('.').shift()));

                promiseTasks = paths
                    .map((path, i) => ({ name: filenames[ i ], promise: igv.xhr.loadJson(( root + '/' + path)) }))
                    .reverse();

                if (app.ModalTable.getAssembly(genomeID)) {
                    encodePromiseTask = { name: 'ENCODE', promise: self.promisifiedCreateEncodeTable(genomeID) };
                    promiseTasks.unshift(encodePromiseTask);
                }

                if (gtex_lut[ genomeID ]) {
                    gTexPromiseTask = { name: 'GTEx', promise: igv.GtexUtils.getTissueInfo(gtex_lut[ genomeID ])};
                    promiseTasks.unshift(gTexPromiseTask);
                }

                Promise
                    .all( promiseTasks.map((task) => (task.promise)))
                    .then((results) => {
                        let menuItemConfigurations,
                            names;

                        // hack to include GTex
                        menuItemConfigurations = results.map((m) => {
                            let cooked;

                            // GTEx
                            if (m[ 'tissueSummary' ]) {

                                cooked = m;
                                Object.defineProperty(cooked, 'tracks',
                                    Object.getOwnPropertyDescriptor(cooked, 'tissueSummary'));

                                delete cooked[ 'tissueSummary' ];

                                cooked[ 'label' ] = 'GTEx';

                            } else if (Array.isArray(m)) {
                                cooked = { label: 'ENCODE', data: m };
                            } else {
                                cooked = m;
                            }

                            return cooked;
                        });

                        names = promiseTasks.map((task) => (task.name));
                        menuItemConfigurations
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
                                    let markup;

                                    // markup = config.description || ('Load Track: ' + config.label);
                                    markup = config.description || config.label;

                                    self.$modal.find('#igv-app-generic-track-select-modal-label').html(markup);

                                    if ('ENCODE' === config.label) {
                                        self.encodeTable.buildTableWithData(config.data);
                                        self.encodeTable.$modal.modal('show');
                                    } else {
                                        configureModalSelectList(self.$modal, config.tracks, names[i]);
                                        self.$modal.modal('show');
                                    }


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
            url: "https://gtexportal.org/rest/v1/association/singleTissueEqtlByLocation",
            tissueName: tissueInfo.tissueSiteDetailId,
            name: (tissueInfo.tissueSiteDetailId.split('_').join(' ')),
            visibilityWindow: 1000000
        }

    }

    function configureModalSelectList($modal, configurations, promiseTaskName) {

        let $select,
            $option;

        $modal.find('select').remove();

        $select = $('<select>', { class:'form-control' } );
        $modal.find('.form-group').append($select);

        $option = $('<option>', { text:'Choose one of the following...' });
        $select.append($option);

        $option.attr('selected','selected');
        $option.val(undefined);

        configurations
            .reduce(function($accumulator, config) {
                let trackConfiguration;

                // hack to support GTex
                trackConfiguration = ('GTEx' === promiseTaskName) ? igv.GtexUtils.trackConfiguration(config) : config;

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