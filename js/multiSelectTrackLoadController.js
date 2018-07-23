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
            jsonPromises;

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
                return { name: file.name, file: file };
            })
            .reduce(function(obj, item) {
                let key;
                key = item[ 'name' ];
                obj[ key ] = item.file;
                return obj;
            }, {});

        // index files (potentials)
        indexFileCandidates = {};
        files
            .forEach(function (file) {
                let extension;
                extension = igv.getExtension({ url: file });
                if(false === igv.knownFileExtensions.has(extension)) {
                    indexFileCandidates[ file.name ] = file;
                }
            });

        indexFiles = getIndexFiles(dataFiles, indexFileCandidates);









        // bail if no data files are selected
        if (0 === jsonPromises.length && 0 === Object.keys(dataFiles).length) {
            appendNoFilesFoundMarkup(this.$modal_body);
            this.$modal.modal('show');
            return;
        }

        if (jsonPromises.length > 0) {

            Promise
                .all(jsonPromises)
                .then(function (trackConfigurations) {
                    let jsonFiles;
                    
                    trackConfigurations.forEach(function (trackConfiguration) {

                        console.log(JSON.stringify(trackConfiguration));

                        if (undefined === jsonFiles) {
                            jsonFiles = {};
                        }
                        jsonFiles[ trackConfiguration.name ] = trackConfiguration;
                    });

                    renderFiles.call(self, dataFiles, indexFiles, jsonFiles);
                })
                .catch(function (error) {
                    console.log(error);
                });

        } else {
            renderFiles.call(this, dataFiles, indexFiles);
        }

    };

    app.MultiSelectTrackLoadController.prototype.isValidLocalInput = function ($input) {
        return ($input.get(0).files && $input.get(0).files.length > 0);
    };

    function getIndexFiles(dataFiles, indexFileCandidates) {
        let indexFileAssessments,
            indexFiles;

        // add info about presence and requirement (or not) of an index file
        indexFileAssessments = Object
            .keys(dataFiles)
            .map(function (key) {

                // assess the data files need/requirement for index files
                return app.fileutils.getIndexObject(key);

            })
            .map(function (io) {

                // identify the presence/absence of associated index files
                for (let value in io) {
                    if (io.hasOwnProperty(value)) {
                        io[ value ].missing = (undefined === indexFileCandidates[ value ]);
                    }
                }
                return io;
            })
            .filter(function (io) {

                // prune the optional and missing index files for data files
                // that don't require and index file
                if (1 === Object.keys(io).length) {

                    let o;

                    o = io[ Object.keys(io)[ 0 ] ];
                    if( true === o.missing &&  true === o.isOptional) {
                        return false;
                    } else if (false === o.missing && false === o.isOptional) {
                        return true;
                    } else if ( true === o.missing && false === o.isOptional) {
                        return true;
                    } else /*( false === o.missing && true === o.isOptional)*/ {
                        return true;
                    }

                } else {
                    return true;
                }

            });

        indexFiles = {};
        indexFileAssessments.forEach(function (io) {

            for (let ii in io) {

                if (io.hasOwnProperty(ii)) {
                    let obj;

                    obj = io[ ii ];

                    if (undefined === indexFiles[ obj.data ]) indexFiles[ obj.data ] = [];

                    indexFiles[ obj.data ].push(((false === obj.missing) ? indexFileCandidates[ ii ] : undefined));
                }
            }

        });

        return indexFiles;
    }

    function renderFiles(dataFiles, indexFiles, jsonFiles = undefined) {
        let strings;

        strings = [];
        Object
            .keys(dataFiles)
            .forEach(function (name) {

                if (indexFiles[ name ]) {
                    let aa;

                    aa = indexFiles[ name ][ 0 ];
                    if (1 === indexFiles[ name ].length) {

                        if (undefined === aa) {
                            strings.push('DATA ' + name + ' INDEX file is missing');
                        } else {
                            strings.push('DATA ' + name + ' INDEX ' + aa.name);
                        }
                    } else /* BAM Track with two naming conventions */ {
                        let bb;

                        bb = indexFiles[ name ][ 1 ];
                        if (undefined === aa && undefined === bb) {
                            strings.push('DATA ' + name + ' INDEX file is missing');
                        } else {
                            let cc;
                            cc = aa || bb;
                            strings.push('DATA ' + name + ' INDEX ' + cc.name);
                        }

                    }
                } else {
                    strings.push('DATA ' + name);
                }

            });

        if (jsonFiles) {

            Object
                .keys(jsonFiles)
                .forEach(function (key) {
                    strings.push('JSON ' + key);
                });

        }

        appendMarkup(this.$modal_body, strings);

        this.$modal.modal('show');
    }

    function appendMarkup($container, strings) {

        strings.map(function (string) {
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