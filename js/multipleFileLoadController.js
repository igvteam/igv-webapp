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

import * as app_google from './app-google.js';
import { getExtension, getFilename, isKnownFileExtension, isValidIndexExtension, getIndexObjectWithDataName } from './utils.js';

class MultipleFileLoadController {

    constructor (browser, config) {

        this.browser = browser;
        this.config = config;

        if(undefined === this.config.isSessionFile) {
            this.config.isSessionFile = false;
        }

        this.fileLoadHander = config.fileLoadHandler;
        this.configurationHandler = config.configurationHandler;

        this.$modal = config.$modal;
        this.$modal.find('.modal-title').text( config.modalTitle );
        this.$modal_body = this.$modal.find('.modal-body');

        this.createLocalInput(config.$localFileInput);

        if (undefined === config.multipleFileSelection) {
            config.multipleFileSelection = true;
        }
        this.createDropboxButton(config.$dropboxButton, config.multipleFileSelection);

        if (config.$googleDriveButton) {
            this.createGoogleDriveButton(config.$googleDriveButton, config.multipleFileSelection);
        }

    }

    ingestPaths(paths) {

        let self = this,
            dataPaths,
            indexPathCandidates,
            indexPaths,
            indexPathNameSet,
            indexPathNamesLackingDataPaths,
            sessionRetrievalTasks,
            jsonRetrievalTasks,
            configurations;

        // discard current contents of modal body
        this.$modal_body.empty();

        if (true === this.config.isSessionFile) {

            let extension = getExtension(paths[0]);
            let filename = getFilename(paths[0]);

            // hack'ish test for lack of suffix
            if (filename === extension) {
                alert('ERROR: Invalid session file: ' + filename);
                return;
            }

            const extensions = new Set(['json', 'xml']);

            if (false === extensions.has(extension)) {
                alert('ERROR: Invalid session file extension: .' + extension);
                return;
            }

            sessionRetrievalTasks = paths
                .filter((path) => (true === extensions.has( getExtension(path) )) )
                .map((path) => {
                    let url = (path.google_url || path);
                    return { name: getFilename(path), promise: self.browser.loadSession(url)}
                });

            Promise
                .all(sessionRetrievalTasks.map((task) => (task.promise)))
                .then(function (ignore) {
                    console.log('gone baby gone');
                })
                .catch(function (error) {
                    console.log(error);
                });

            return;
        }

        // accumulate JSON retrieval promises
        let jsonPaths = paths.filter((path) => ('json' === getExtension(path)) );
        let remainingPaths;
        if (jsonPaths) {
            remainingPaths = paths.filter((path) => ('json' !== getExtension(path)) )
        } else {
            remainingPaths = paths;
        }

        jsonRetrievalTasks = jsonPaths
            .map((path) => {
                let url = (path.google_url || path);
                return { name: getFilename(path), promise: igv.xhr.loadJson(url) }
            });

        // data (non-JSON)
        dataPaths = remainingPaths
            .filter((path) => (isKnownFileExtension( getExtension(path) )))
            .reduce(function(accumulator, path) {
                accumulator[ getFilename(path) ] = (path.google_url || path);
                return accumulator;
            }, {});

        // index paths (potentials)
        indexPathCandidates = remainingPaths
            .filter((path) => isValidIndexExtension( getExtension(path) ))
            .reduce(function(accumulator, path) {
                accumulator[ getFilename(path) ] = (path.google_url || path);
                return accumulator;
            }, {});

        // identify index paths that are
        // 1) present
        // 2) names of missing index paths for later error reporting
        indexPaths = getIndexPaths(dataPaths, indexPathCandidates);

        indexPathNameSet = new Set();
        for (let key in indexPaths) {
            if (indexPaths.hasOwnProperty(key)) {
                indexPaths[ key ]
                    .forEach(function (obj) {
                        if (obj) {
                            indexPathNameSet.add( obj.name );
                        }
                    });
            }
        }

        indexPathNamesLackingDataPaths = Object
            .keys(indexPathCandidates)
            .reduce(function(accumulator, key) {

                if (false === indexPathNameSet.has(key)) {
                    accumulator.push(key);
                }

                return accumulator;
            }, []);

        configurations = Object
            .keys(dataPaths)
            .reduce(function(accumulator, key) {

                if (false === dataPathIsMissingIndexPath(key, indexPaths) ) {
                    accumulator.push( self.configurationHandler(key, dataPaths[key], indexPaths) )
                }

                return accumulator;
            }, []);

        if (jsonRetrievalTasks.length > 0) {

            this.jsonRetrievalSerial(jsonRetrievalTasks, configurations, dataPaths, indexPaths, indexPathNamesLackingDataPaths);

        } else {

            if (configurations.length > 0) {
                this.fileLoadHander( configurations );
            }

            this.renderTrackFileSelection(dataPaths, indexPaths, indexPathNamesLackingDataPaths, new Set());
        }

    }

    createLocalInput($input) {
        let self = this;

        $input.on('change', function () {

            if (true === MultipleFileLoadController.isValidLocalFileInput($(this))) {

                let input = $(this).get(0);
                let list = Array.from(input.files);
                input.value = '';

                self.ingestPaths(list);
            }

        });

    }

    createDropboxButton($dropboxButton, multipleFileSelection) {
        let self = this;

        $dropboxButton.on('click', function () {
            let obj;

            obj =
                {
                    success: (dbFiles) => (self.ingestPaths(dbFiles.map((dbFile) => dbFile.link))),
                    cancel: function() { },
                    linkType: "preview",
                    multiselect: multipleFileSelection,
                    folderselect: false,
                };

            Dropbox.choose( obj );
        });
    }

    createGoogleDriveButton($button, multipleFileSelection) {

        let self = this,
            paths;

        $button.on('click', function () {

            app_google.createDropdownButtonPicker(multipleFileSelection, (googleDriveResponses) => {
                paths = googleDriveResponses.map((response) => ({ name: response.name, google_url: response.url }));
                self.ingestPaths(paths);
            });

        });

    }

    jsonRetrievalParallel(retrievalTasks, configurations, dataPaths, indexPaths, indexPathNamesLackingDataPaths) {
        let self = this;

        Promise
            .all(retrievalTasks.map((task) => (task.promise)))
            .then(function (list) {

                if (list && list.length > 0) {
                    let jsonConfigurations;

                    jsonConfigurations = list
                        .reduce(function(accumulator, item) {

                            if (true === Array.isArray(item)) {
                                item.forEach(function (config) {
                                    accumulator.push(config);
                                })
                            } else {
                                accumulator.push(item);
                            }

                            return accumulator;
                        }, []);

                    configurations.push.apply(configurations, jsonConfigurations);
                    self.fileLoadHander(configurations);

                    self.renderTrackFileSelection(dataPaths, indexPaths, indexPathNamesLackingDataPaths, new Set());
                } else {
                    self.renderTrackFileSelection(dataPaths, indexPaths, indexPathNamesLackingDataPaths, new Set());
                }

            })
            .catch(function (error) {
                console.log(error);
                self.renderTrackFileSelection(dataPaths, indexPaths, indexPathNamesLackingDataPaths, new Set());
            });

    }

    jsonRetrievalSerial(retrievalTasks, configurations, dataPaths, indexPaths, indexPathNamesLackingDataPaths) {

        let self = this,
            taskSet,
            successSet,
            jsonConfigurations,
            ignore;

        taskSet = new Set(retrievalTasks.map(task => task.name));
        successSet = new Set();
        jsonConfigurations = [];
        retrievalTasks
            .reduce((promiseChain, task) => {

                return promiseChain
                    .then((chainResults) => {
                        let promise;

                        promise = task.promise;

                        return promise
                            .then((currentResult) => {

                                successSet.add(task.name);

                                console.log('parsed json file: ' + task.name);
                                jsonConfigurations = [...chainResults, currentResult];
                                return jsonConfigurations;
                            })
                    })
            }, Promise.resolve([]))
            .then(ignore => {

                self.jsonConfigurator(dataPaths, indexPaths, indexPathNamesLackingDataPaths, jsonConfigurations, configurations, taskSet, successSet);

            })
            .catch(function (error) {

                self.jsonConfigurator(dataPaths, indexPaths, indexPathNamesLackingDataPaths, jsonConfigurations, configurations, taskSet, successSet);

            });

    }

    renderTrackFileSelection(dataPaths, indexPaths, indexPathNamesLackingDataPaths, jsonFailureNameSet) {
        let markup;

        markup = Object
            .keys(dataPaths)
            .reduce(function(accumulator, name) {

                if (true === dataPathIsMissingIndexPath(name, indexPaths)) {
                    accumulator.push('<div><span>&nbsp;&nbsp;&nbsp;&nbsp;' + name + '</span>' + '&nbsp;&nbsp;&nbsp;ERROR: index file must also be selected</div>');
                }

                return accumulator;
            }, []);

        indexPathNamesLackingDataPaths
            .forEach(function (name) {
                markup.push('<div><span>&nbsp;&nbsp;&nbsp;&nbsp;' + name + '</span>' + '&nbsp;&nbsp;&nbsp;ERROR: data file must also be selected</div>');
            });

        jsonFailureNameSet
            .forEach((name) => {
                markup.push('<div><span>&nbsp;&nbsp;&nbsp;&nbsp;' + name + '</span>' + '&nbsp;&nbsp;&nbsp;ERROR: problems parsing JSON</div>');
            });

        if (markup.length > 0) {
            let header;

            header = '<div> The following files were not loaded ...</div>';
            markup.unshift(header);
            this.$modal_body.append(markup.join(''));
            this.$modal.modal('show');
        }
    }

    jsonConfigurator(dataPaths, indexPaths, indexPathNamesLackingDataPaths, jsonConfigurations, configurations, taskSet, successSet) {
        let self = this,
            failureSet;

        if (jsonConfigurations.length > 0) {
            let reduction;

            reduction = jsonConfigurations
                .reduce(function(accumulator, item) {

                    if (true === Array.isArray(item)) {
                        item.forEach(function (config) {
                            accumulator.push(config);
                        })
                    } else {
                        accumulator.push(item);
                    }

                    return accumulator;
                }, []);

            configurations.push.apply(configurations, reduction);
            self.fileLoadHander(configurations);

            failureSet = [...taskSet].filter(x => !successSet.has(x));
            self.renderTrackFileSelection(dataPaths, indexPaths, indexPathNamesLackingDataPaths, failureSet);

        } else {

            if (configurations.length > 0) {
                self.fileLoadHander(configurations);
            }

            failureSet = [...taskSet].filter(x => !successSet.has(x));
            self.renderTrackFileSelection(dataPaths, indexPaths, indexPathNamesLackingDataPaths, failureSet);
        }
    }

    static isValidLocalFileInput($input) {
        return ($input.get(0).files && $input.get(0).files.length > 0);
    }

    static trackConfigurator(dataKey, dataValue, indexPaths) {
        let config;

        config =
            {
                name: dataKey,
                filename:dataKey,

                format: igv.inferFileFormat(dataKey),

                url: dataValue,
                indexURL: getIndexURL(indexPaths[ dataKey ])
            };

        igv.inferTrackTypes(config);

        return config;

    }

    static genomeConfigurator(dataKey, dataValue, indexPaths) {

        let config;

        config =
            {
                fastaURL: dataValue,
                indexURL: getIndexURL(indexPaths[ dataKey ])
            };

        return config;

    }

    static sessionConfigurator(dataKey, dataValue, indexPaths) {
        return { session: dataValue };
    }
}

function getIndexURL(indexValue) {

    if (indexValue) {

        if        (indexValue[ 0 ]) {
            return indexValue[ 0 ].path;
        } else if (indexValue[ 1 ]) {
            return indexValue[ 1 ].path;
        } else {
            return undefined;
        }

    } else {
        return undefined;
    }

}

function getIndexPaths(dataPathNames, indexPathCandidates) {
    let list,
        indexPaths;

    // add info about presence and requirement (or not) of an index path
    list = Object
        .keys(dataPathNames)
        .map(function (dataPathName) {
            let indexObject;

            // assess the data files need/requirement for index files
            indexObject  = getIndexObjectWithDataName(dataPathName);

            // identify the presence/absence of associated index files
            for (let p in indexObject) {
                if (indexObject.hasOwnProperty(p)) {
                    indexObject[ p ].missing = (undefined === indexPathCandidates[ p ]);
                }
            }

            return indexObject;
        })
        .filter(function (indexObject) {

            // prune optional AND missing index files
            if (1 === Object.keys(indexObject).length) {

                let obj;

                obj = indexObject[ Object.keys(indexObject)[ 0 ] ];
                if( true === obj.missing &&  true === obj.isOptional) {
                    return false;
                } else if (false === obj.missing && false === obj.isOptional) {
                    return true;
                } else if ( true === obj.missing && false === obj.isOptional) {
                    return true;
                } else /*( false === obj.missing && true === obj.isOptional)*/ {
                    return true;
                }

            } else {
                return true;
            }

        });

    indexPaths = list
        .reduce(function(accumulator, indexObject) {

            for (let key in indexObject) {

                if (indexObject.hasOwnProperty(key)) {
                    let value;

                    value = indexObject[ key ];

                    if (undefined === accumulator[ value.data ]) {
                        accumulator[ value.data ] = [];
                    }

                    accumulator[ value.data ].push(((false === value.missing) ? { name: key, path: indexPathCandidates[ key ] } : undefined));
                }
            }

            return accumulator;
        }, {});

    return indexPaths;
}

function dataPathIsMissingIndexPath(dataName, indexPaths) {
    let status,
        aa;

    // if index for data is not in indexPaths it has been culled
    // because it is optional AND missing
    if (undefined === indexPaths[ dataName ]) {

        status = false;
    }

    else if (indexPaths && indexPaths[ dataName ]) {

        aa = indexPaths[ dataName ][ 0 ];
        if (1 === indexPaths[ dataName ].length) {
            status = (undefined === aa);
        } else /* BAM Track with two naming conventions */ {
            let bb;
            bb = indexPaths[ dataName ][ 1 ];
            if (aa || bb) {
                status = false
            } else {
                status = true;
            }
        }

    } else {
        status = true;
    }

    return status;

}

export default MultipleFileLoadController;
