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

    app.MultiSelectTrackLoadController = function (browser, config) {
        this.browser = browser;

        this.$modal = config.$modal;
        this.$modal_body = this.$modal.find('.modal-body');

        createDropboxButton.call(this, config.$dropboxButton);

        createGoogleDriveButton.call(this, config.$googleDriveButton);
    };

    app.MultiSelectTrackLoadController.prototype.ingestPaths = function (paths) {

        let self = this,
            dataPaths,
            indexPathCandidates,
            indexPaths,
            indexPathNameSet,
            indexPathNamesLackingDataPaths,
            jsonRetrievalPromises,
            jsonNames,
            trackConfigurations;

        // discard current contents of modal body
        this.$modal_body.empty();

        // accumulate JSON retrieval promises
        jsonRetrievalPromises = paths
            .filter((path) => ('json' === app.utils.getExtension(path)))
            .map((path) => {
                let url;
                url = (path.google_url || path);
                return igv.xhr.loadJson(url)
            });

        // data (non-JSON)
        dataPaths = paths
            .filter((path) => (igv.knownFileExtensions.has( app.utils.getExtension(path) )))
            .reduce(function(accumulator, path) {
                accumulator[ app.utils.getFilename(path) ] = (path.google_url || path);
                return accumulator;
            }, {});

        // index paths (potentials)
        indexPathCandidates = paths
            .filter((path) => app.fileutils.isValidIndexExtension( app.utils.getExtension(path) ))
            .reduce(function(accumulator, path) {
                accumulator[ app.utils.getFilename(path) ] = (path.google_url || path);
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

        trackConfigurations = Object
            .keys(dataPaths)
            .reduce(function(accumulator, key) {

                if (false === dataPathIsMissingIndexPath(key, indexPaths) ) {
                    accumulator.push( trackConfigurator(key, dataPaths[key], indexPaths) )
                }

                return accumulator;
            }, []);

        if (jsonRetrievalPromises.length > 0) {

            Promise
                .all(jsonRetrievalPromises)
                .then(function (list) {
                    let jsonTrackConfigurations;

                    jsonTrackConfigurations = list
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

                    jsonNames = jsonTrackConfigurations
                        .map(function (config) {
                            return config.name;
                        });

                    trackConfigurations.push.apply(trackConfigurations, jsonTrackConfigurations);

                    igv.browser.loadTrackList( trackConfigurations );

                    renderTrackFileSelection.call(self, dataPaths, indexPaths, indexPathNamesLackingDataPaths, jsonNames);

                })
                .catch(function (error) {
                    console.log(error);
                });

        } else {

            if (trackConfigurations.length > 0) {
                igv.browser.loadTrackList( trackConfigurations );
            }

            renderTrackFileSelection.call(this, dataPaths, indexPaths, indexPathNamesLackingDataPaths, []);
        }

    };

    app.MultiSelectTrackLoadController.prototype.isValidLocalFileInput = function ($input) {
        return ($input.get(0).files && $input.get(0).files.length > 0);
    };

    function getIndexPaths(dataPathNames, indexPathCandidates) {
        let list,
            indexPaths,
            dev_null;

        // add info about presence and requirement (or not) of an index path
        list = Object
            .keys(dataPathNames)
            .map(function (dataPathName) {
                let indexObject;

                // assess the data files need/requirement for index files
                indexObject  = app.fileutils.getIndexObjectWithDataName(dataPathName);

                // identify the presence/absence of associated index files
                for (let p in indexObject) {
                    if (indexObject.hasOwnProperty(p)) {
                        indexObject[ p ].missing = (undefined === indexPathCandidates[ p ]);
                    }
                }

                return indexObject;
            })
            .filter(function (indexObject) {

                // prune the optional and missing index files for data files
                // that don't require and index file
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

    function trackConfigurator(dataKey, dataValue, indexPaths) {
        let config;

        function getIndexURL(indexValue) {

            if (indexValue) {
                let list;

                list = indexValue;
                if (list) {
                    let url;
                    url = list[ 0 ].path || list[ 1 ].path;
                    return url;
                }

            } else {
                return undefined;
            }

        }

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

    function renderTrackFileSelection(dataPaths, indexPaths, indexPathsLackingDataPaths) {
        let markup;

        markup = Object
            .keys(dataPaths)
            .reduce(function(accumulator, name) {

                if (true === dataPathIsMissingIndexPath(name, indexPaths)) {
                    accumulator.push('<div><span>&nbsp;&nbsp;&nbsp;&nbsp;' + name + '</span>' + '&nbsp;&nbsp;&nbsp;ERROR: index file must also be selected</div>');
                }

                return accumulator;
            }, []);

        indexPathsLackingDataPaths
            .forEach(function (name) {
                markup.push('<div><span>&nbsp;&nbsp;&nbsp;&nbsp;' + name + '</span>' + '&nbsp;&nbsp;&nbsp;ERROR: data file must also be selected</div>');
            });

        if (markup.length > 0) {
            let header;

            header = '<div> The following files were not loaded ...</div>';
            markup.unshift(header);
            this.$modal_body.append(markup.join(''));
            this.$modal.modal('show');
        }
    }

    function dataPathIsMissingIndexPath(dataName, indexPaths) {
        let status,
            aa;

        if (indexPaths && indexPaths[ dataName ]) {

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
            status = false;
        }

        return status;

    }

    function createDropboxButton($dropboxButton) {
        let self = this;

        $dropboxButton.on('click', function () {
            let obj;

            obj =
                {
                    success: (dbFiles) => (self.ingestPaths(dbFiles.map((dbFile) => dbFile.link))),
                    cancel: function() { },
                    linkType: "preview",
                    multiselect: true,
                    folderselect: false,
                };

            Dropbox.choose( obj );
        });
    }

    function createGoogleDriveButton($button) {

        let self = this,
            paths;

        $button.on('click', function () {

            app.Google.createDropdownButtonPicker(function (googleDriveResponses) {
                paths = googleDriveResponses.map((response) => ({ name: response.name, google_url: response.url }));
                self.ingestPaths(paths);
            });

        });

    }

    return app;

})(app || {});