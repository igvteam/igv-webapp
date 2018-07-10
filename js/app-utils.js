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

    app.utils =
        {
            promisifyFileReader: function (filereader) {

                function composeAsync (key) {
                    return function () {
                        var args = arguments;

                        return new Promise (function (resolve, reject) {
                            //
                            function resolveHandler () {
                                cleanHandlers();
                                resolve(filereader.result)
                            }
                            function rejectHandler () {
                                cleanHandlers();
                                reject(filereader.error)
                            }
                            function cleanHandlers () {
                                filereader.removeEventListener('load', resolveHandler);
                                filereader.removeEventListener('abort', rejectHandler);
                                filereader.removeEventListener('error', rejectHandler);
                            }

                            // :: ehhhhh
                            filereader.addEventListener('load', resolveHandler);
                            filereader.addEventListener('abort', rejectHandler);
                            filereader.addEventListener('error', rejectHandler);

                            // :: go!
                            filereader[key].apply(filereader, args);
                        })
                    }
                }
                for (var key in filereader) {
                    if (!key.match(/^read/) || typeof filereader[key] !== 'function') {
                        continue;
                    }
                    filereader[key + 'Async'] = composeAsync(key);
                }
            },

            configureModal: function (loader, $modal, okHandler = undefined) {
                let $dismiss,
                    $ok,
                    doOk;

                // upper dismiss - x - button
                $dismiss = $modal.find('.modal-header button:nth-child(1)');
                $dismiss.on('click', function () {
                    loader.dismiss();
                });

                // lower dismiss - close - button
                $dismiss = $modal.find('.modal-footer button:nth-child(1)');
                $dismiss.on('click', function () {
                    loader.dismiss();
                });

                // ok - button
                $ok = $modal.find('.modal-footer button:nth-child(2)');

                if (okHandler) {
                    doOk = okHandler;
                } else {
                    doOk = function () {
                        if (loader.okHandler()) {
                            loader.dismiss();
                            $modal.modal('hide');
                        }
                    };
                }

                $ok.on('click', doOk);

            },

            loadGenome: function (genome) {

                igv.browser
                    .loadGenome(genome)
                    .then(function (genome) {

                        if (genome.id && igv.ModalTable.getAssembly(genome.id)) {
                            app.trackLoadController.createEncodeTable(genome.id);
                            app.trackLoadController.updateAnnotationsSelectList(genome.id);
                        } else {
                            app.trackLoadController.encodeTable.hidePresentationButton();
                        }

                    })
                    .catch(function (error) {
                        igv.presentAlert(error);
                    });

            }
        };

    return app;
})(app || {});