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

        let files,
            dataFiles,
            indexFileCandidates,
            indexFileAssessments,
            indexFileFinalists,
            indexLUT,
            strings,
            dev_null;

        // discard current contents of modal body
        this.$modal_body.empty();

        // Array-ify FileList object
        files = Array.from(input.files);

        // data files (non-JSON)
        dataFiles = files.filter(function (file) {
            let extension;
            extension = igv.getExtension({ url: file });
            return igv.knownFileExtensions.has(extension);
        });

        // index files (potentials)
        indexFileCandidates = {};
        files.forEach(function (file) {
            let extension;
            extension = igv.getExtension({ url: file });
            if(false === igv.knownFileExtensions.has(extension)) {
                indexFileCandidates[ file.name ] = file;
            }
        });

        // bail if no data files are selected
        if (undefined === dataFiles || 0 === dataFiles.length) {
            appendNoFilesFoundMarkup(this.$modal_body);
            return;
        }

        // add info about presence and requirement (or not) of an index file
        indexFileFinalists = dataFiles
            .map(function (file) {

                // assess the data files need/requirement for index files
                return app.fileutils.getIndexObject(file);
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

        // invert indexFileFinalists to become an index file LUT
        indexLUT = {};
        indexFileFinalists.forEach(function (io) {

            for (let ii in io) {
                if (io.hasOwnProperty(ii)) {
                    let outer;

                    outer = io[ ii ];

                    if (undefined === indexLUT[ outer.data ]) indexLUT[ outer.data ] = [];

                    indexLUT[ outer.data ].push(((false === outer.missing) ? indexFileCandidates[ ii ] : undefined));
                }
            }


        });

        strings = [];
        dataFiles.forEach(function (file) {
            let name;

            name = igv.getFilename(file);
            if (indexLUT[ name ]) {
                let aa;

                aa = indexLUT[ name ][ 0 ];
                if (1 === indexLUT[ name ].length) {
                    
                    if (undefined === aa) {
                        strings.push('DATA ' + name + ' INDEX file is missing');
                    } else {
                        strings.push('DATA ' + name + ' INDEX ' + aa.name);
                    }
                } else /* BAM Track with two naming conventions */ {
                    let bb;

                    bb = indexLUT[ name ][ 1 ];
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

        appendMarkup(this.$modal_body, strings);

        this.$modal.modal('show');
    };

    app.MultiSelectTrackLoadController.prototype.isValidLocalInput = function ($input) {
        return ($input.get(0).files && $input.get(0).files.length > 0);
    };

    function reconcileIndexFiles(dataFileNames, indexLUT) {

        let strings;

        dataFileNames.forEach(function (name) {

            if (indexLUT[ name ]) {

                indexLUT[ name ].forEach(function (obj) {
                    console.log('data ' + name + ' index ' + obj.index + (true === obj.missing ? ' MISSING' : ''));
                });

            } else {
                console.log('data ' + name);
            }

        });
    }

    function fileNames (files) {
        return files.map(function (file) { return file.name; });
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