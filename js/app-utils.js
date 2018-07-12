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

            isJSON: function (thang) {
                // Better JSON test. JSON.parse gives false positives.
                return (true === (thang instanceof Object) && false === (thang instanceof File));
            },

            configureModal: function (loader, $modal, okHandler = undefined) {
                let $dismiss,
                    $ok;

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

                $ok.on('click', function () {

                    if (okHandler) {

                        okHandler();
                    } else {

                        if (loader.fileLoadManager.okHandler()) {
                            loader.dismiss();
                            $modal.modal('hide');
                        }
                    }

                });

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