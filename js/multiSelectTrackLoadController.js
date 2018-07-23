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

    app.MultiSelectTrackLoadController = function (browser, $modal) {
        this.browser = browser;
        this.$modal = $modal;
        this.$modal_body = $modal.find('.modal-body');
    };

    app.MultiSelectTrackLoadController.prototype.ingestLocalFiles = function (input) {

        let self = this,
            files,
            dataFiles,
            indexFileCandidates,
            indexFiles,
            jsonPromises,
            trackConfigurations;

        // discard current contents of modal body
        this.$modal_body.empty();

        // Array-ify FileList object
        files = Array.from(input.files);

        // accumumate JSON file retrieval promises
        jsonPromises = files
            .filter(function (file) {
                return 'json' === igv.getExtension({ url: file });
            })
            .map(function (file) {
                return igv.xhr.loadJson(file);
            });

        // data files (non-JSON)
        dataFiles = files
            .filter(function (file) {
                let extension;
                extension = igv.getExtension({ url: file });
                return igv.knownFileExtensions.has(extension);
            })
            .map(function (file) {

                // map to name/file object
                return { name: file.name, file: file };
            })
            .reduce(function(accumulator, item) {
                let key;

                // reduce list of name/file objects to dictionary key'ed by 'name' value
                key = item[ 'name' ];
                accumulator[ key ] = item.file;
                return accumulator;
            }, {});

        // index files (potentials)
        indexFileCandidates = files
            .filter(function (file) {
                return !(igv.knownFileExtensions.has( igv.getExtension({ url: file }) ));
            })
            .reduce(function(accumulator, file) {
                accumulator[ file.name ] = file;
                return accumulator;
            }, {});

        indexFiles = getIndexFiles(dataFiles, indexFileCandidates);

        // bail if no data files are selected
        if (0 === jsonPromises.length && 0 === Object.keys(dataFiles).length) {
            appendNoFilesFoundMarkup(this.$modal_body);
            this.$modal.modal('show');
            return;
        }

        trackConfigurations = Object
            .keys(dataFiles)
            .map(function (dataKey) {
                let dataValue;

                dataValue = dataFiles[ dataKey ];
                return trackConfigurator(dataKey, dataValue, indexFiles);
            });

        if (jsonPromises.length > 0) {

            Promise
                .all(jsonPromises)
                .then(function (jsonTrackConfigurations) {
                    let jsonFiles;

                    trackConfigurations.push.apply(trackConfigurations, jsonTrackConfigurations);

                    igv.browser.loadTrackList( trackConfigurations );

                    // jsonFiles = jsonTrackConfigurations
                    //     .reduce(function(accumulator, config) {
                    //         accumulator[ config.name ] = config;
                    //         return accumulator;
                    //     }, {});
                    //
                    // renderFiles.call(self, dataFiles, indexFiles, jsonFiles);
                })
                .catch(function (error) {
                    console.log(error);
                });

        } else {
            // renderFiles.call(this, dataFiles, indexFiles);
            igv.browser.loadTrackList( trackConfigurations );

        }

    };

    app.MultiSelectTrackLoadController.prototype.isValidLocalInput = function ($input) {
        return ($input.get(0).files && $input.get(0).files.length > 0);
    };

    function getIndexFiles(dataFiles, indexFileCandidates) {
        let indexFiles;

        // add info about presence and requirement (or not) of an index file
        indexFiles = Object
            .keys(dataFiles)
            .map(function (key) {
                let indexObject;

                // assess the data files need/requirement for index files
                indexObject  = app.fileutils.getIndexObject(key);

                // identify the presence/absence of associated index files
                for (let p in indexObject) {
                    if (indexObject.hasOwnProperty(p)) {
                        indexObject[ p ].missing = (undefined === indexFileCandidates[ p ]);
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

            })
            .reduce(function(accumulator, indexObject) {

                for (let key in indexObject) {

                    if (indexObject.hasOwnProperty(key)) {
                        let value;

                        value = indexObject[ key ];

                        if (undefined === accumulator[ value.data ]) {
                            accumulator[ value.data ] = [];
                        }

                        accumulator[ value.data ].push(((false === value.missing) ? indexFileCandidates[ key ] : undefined));
                    }
                }

                return accumulator;
            }, {});

        return indexFiles;
    }

    function trackConfigurator(dataKey, dataValue, indexFiles) {
        let config;

        function getIndexURL(indexValue) {

            if (indexValue) {
                let list;

                list = indexValue;
                if (1 === list.length) {
                    return list[ 0 ];
                } else  /* BAM index files 2 === list.length */ {
                    return list[ 0 ] || list[ 1 ];
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
                indexURL: getIndexURL(indexFiles[ dataKey ])
            };

        igv.inferTrackTypes(config);

        return config;

    }

    function renderFiles(dataFiles, indexFiles, jsonFiles = undefined) {
        let strings;

        strings = Object
            .keys(dataFiles)
            .reduce(function(accumulator, name) {

                if (indexFiles[ name ]) {
                    let aa;

                    aa = indexFiles[ name ][ 0 ];
                    if (1 === indexFiles[ name ].length) {

                        if (undefined === aa) {
                            accumulator.push('DATA ' + name + ' INDEX file is missing');
                        } else {
                            accumulator.push('DATA ' + name + ' INDEX ' + aa.name);
                        }

                    } else /* BAM Track with two naming conventions */ {
                        let bb;

                        bb = indexFiles[ name ][ 1 ];
                        if (undefined === aa && undefined === bb) {
                            accumulator.push('DATA ' + name + ' INDEX file is missing');
                        } else {
                            let cc;
                            cc = aa || bb;
                            accumulator.push('DATA ' + name + ' INDEX ' + cc.name);
                        }

                    }
                } else {
                    accumulator.push('DATA ' + name);
                }

                return accumulator;
            }, []);

        if (jsonFiles) {
            let jsonStrings;

            jsonStrings = Object
                .keys(jsonFiles)
                .reduce(function (accumulator, name) {
                    accumulator.push('JSON ' + name);
                    return accumulator;
                }, []);

            strings.push.apply(strings, jsonStrings);
        }

        appendMarkup(this.$modal_body, strings);

        this.$modal.modal('show');
    }

    function appendMarkup($container, strings) {

        strings
            .map(function (string) {
            let $p;
            $p = $('<p>');
            $p.text(string);
            $container.append($p);
        });
    }

    function appendNoFilesFoundMarkup($container) {
        let string;

        string = [ 'No Track Files Found' ];
        appendMarkup($container, string);
    }

    return app;

})(app || {});