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
import { getExtension, getFilename, validIndexExtensionSet, isKnownFileExtension, isValidIndexExtension, getIndexObjectWithDataName } from './utils.js';

const indexableFormats = new Set(["bed", "gff", "gtf", "gff3", "bedgraph"]);

class MultipleFileLoadController {

    constructor (browser, config) {

        this.browser = browser;
        this.config = config;

        if (undefined === this.config.multipleFileSelection) {
            this.config.multipleFileSelection = true;
        }

        this.pathValidator = config.pathValidator;
        this.jsonFileValidator = config.jsonFileValidator;
        this.fileLoadHander = config.fileLoadHandler;
        this.configurationHandler = config.configurationHandler;

        this.$modal = config.$modal;
        this.$modal_body = this.$modal.find('.modal-body');

        this.createLocalInput(config.$localFileInput);

        this.createDropboxButton(config.$dropboxButton, config.multipleFileSelection);

        if (config.$googleDriveButton) {
            this.createGoogleDriveButton(config.$googleDriveButton, config.multipleFileSelection);
        }

    }

    async ingestPaths(paths) {

        let self = this,
            dataPaths,
            indexPathCandidates,
            indexPaths,
            indexPathNameSet,
            indexPathNamesLackingDataPaths,
            jsonPromises,
            configurations;

        // handle Google Drive paths (not already handled via Google Drive Picker)
        let tmp = [];
        let googleDrivePaths = [];
        for (let path of paths) {

            if (igv.isFilePath(path)) {
                tmp.push(path);
            } else if (undefined === path.google_url && path.includes('drive.google.com')) {
                const fileInfo = await igv.google.getDriveFileInfo(path);
                googleDrivePaths.push({ filename: fileInfo.name, name: fileInfo.name, google_url: path});
            } else {
                tmp.push(path);
            }
        }

        paths = tmp.concat(googleDrivePaths);

        // isolate JSON paths
        let jsonPaths = paths.filter(path => 'json' === getExtension(path) );

        let remainingPaths;
        if (jsonPaths.length > 0) {

            // accumulate JSON retrieval Promises
            jsonPromises = jsonPaths
                .map((path) => {
                    let url = (path.google_url || path);
                    return { name: getFilename(path), promise: igv.xhr.loadJson(url) }
                });

            // validate JSON
            const jsons = await Promise.all(jsonPromises.map(task => task.promise));
            const booleans = jsons.map(json => self.jsonFileValidator(json));
            const invalids = booleans
                .map((boolean, index) => { return { isValid: boolean, path: jsonPaths[ index ] } })
                .filter(o => false === o.isValid);

            if (invalids.length > 0) {
                this.presentInvalidFiles( invalids.map(o => o.path) );
                return;
            }

            // Handle Session file. There can only be ONE.
            const json = jsons.pop();
            if (true === MultipleFileLoadController.sessionJSONValidator(json)) {
                let path = jsonPaths.pop();

                if (path.google_url) {
                    this.browser.loadSession({ url:path.google_url, filename:path.name });
                } else {
                    let o = {};
                    o.filename = getFilename(path);
                    if (true === igv.isFilePath(path)) {
                        o.file = path;
                    } else {
                        o.url = path;
                    }
                    this.browser.loadSession(o);
                }

                return;
            }

            // non-JSON paths
            remainingPaths = paths.filter((path) => ('json' !== getExtension(path)) )

        } else {

            // there are no JSON paths
            remainingPaths = paths;
        }

        // bail if no files
        if (0 === jsonPaths.length && 0 === remainingPaths.length) {
            igv.browser.presentAlert("ERROR: No valid data files submitted");
            return;
        }


        // Isolate XML paths. We only care about one and we assume it is a session path
        let xmlPaths = remainingPaths.filter(path => 'xml' === getExtension(path) );

        if (xmlPaths.length > 0) {
            let path = xmlPaths.pop();
            let o = {};
            o.filename = getFilename(path);
            if (true === igv.isFilePath(path)) {
                o.file = path;
            } else {
                o.url = path.google_url || path;
            }
            this.browser.loadSession(o);

            return;
        }

        // validate data paths (non-JSON)
        let extensions = remainingPaths.map(path => getExtension(path));

        if (extensions.length > 0) {
            let results = extensions.map((extension) => self.pathValidator( extension ));

            if (results.length > 0) {

                let invalid = results
                    .map((boolean, index) => { return { isValid: boolean, path: remainingPaths[ index ] } })
                    .filter(obj => false === obj.isValid);

                if (invalid.length > 0) {
                    this.presentInvalidFiles( invalid.map(o => o.path) );
                    return;
                }

            }
        }

        // isolate data paths in dictionary
        dataPaths = createDataPathDictionary(remainingPaths);

        // isolate index path candidates in dictionary
        indexPathCandidates = createIndexPathCandidateDictionary(remainingPaths);

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
            .reduce((accumulator, key) => {

                if (false === indexPathNameSet.has(key)) {
                    accumulator.push(key);
                }

                return accumulator;
            }, []);

        configurations = Object
            .keys(dataPaths)
            .reduce((accumulator, key) => {

                if (false === dataPathIsMissingIndexPath(key, indexPaths) ) {
                    accumulator.push( self.configurationHandler(key, dataPaths[key], indexPaths) )
                }

                return accumulator;
            }, []);

        if (jsonPaths.length > 0) {

            this.jsonRetrievalSerial(jsonPromises, configurations, dataPaths, indexPaths, indexPathNamesLackingDataPaths);

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

                // paths = googleDriveResponses.map((response) => ({ name: response.name, google_url: response.url }));

                paths = googleDriveResponses
                    .map((response) => {
                        let result =
                            {
                                filename: response.name,
                                name: response.name,
                                google_url: response.url
                            };

                        return result;
                    });
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

            this.$modal.find('.modal-title').text( this.config.modalTitle );
            this.$modal_body.empty();
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

    presentInvalidFiles (paths) {

        let markup = [];

        let header = '<div> Invalid Files </div>';
        markup.push(header);

        for (let path of paths) {
            let name = getFilename(path);
            markup.push('<div><span>' + name + '</span>' + '</div>');
        }

        this.$modal.find('.modal-title').text( this.config.modalTitle );
        this.$modal_body.empty();
        this.$modal_body.append(markup.join(''));
        this.$modal.modal('show');

    }

    static isValidLocalFileInput($input) {
        return ($input.get(0).files && $input.get(0).files.length > 0);
    }

    //
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

        const indexURL = getIndexURL(indexPaths[ dataKey ]);
        if(indexURL) {
            config.indexURL = indexURL
        } else {
            if(indexableFormats.has(config.format)) {
                config.indexed = false
            }
        }

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

    //
    static genomeJSONValidator(json) {
        let candidateSet = new Set(Object.keys(json));
        return candidateSet.has('fastaURL');
    }

    static sessionJSONValidator(json) {
        let candidateSet = new Set(Object.keys(json));
        return candidateSet.has('genome') || candidateSet.has('reference');
    }

    static trackJSONValidator(json) {
        let candidateSet = new Set(Object.keys(json));
        return candidateSet.has('url');
    }

    //
    static genomePathValidator(extension) {
        let referenceSet = new Set(['fai', 'fa', 'fasta']);
        return referenceSet.has(extension);
    }

    static trackPathValidator(extension) {
        return igv.knownFileExtensions.has(extension) || validIndexExtensionSet.has(extension);
    }

}

function createDataPathDictionary(paths) {

    return paths
        .filter((path) => (isKnownFileExtension( getExtension(path) )))
        .reduce((accumulator, path) => {
            accumulator[ getFilename(path) ] = (path.google_url || path);
            return accumulator;
        }, {});

}

function createIndexPathCandidateDictionary (paths) {

    return paths
        .filter((path) => isValidIndexExtension( getExtension(path) ))
        .reduce(function(accumulator, path) {
            accumulator[ getFilename(path) ] = (path.google_url || path);
            return accumulator;
        }, {});

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
