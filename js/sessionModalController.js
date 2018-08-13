/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2016-2017 The Regents of the University of California
 * Author: Jim Robinson
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * Created by dat on 5/8/18.
 */

'use strict';

var app = (function (app) {
    app.SessionModalController = function (browser, config) {

        let self = this,
            loaderConfig,
            $dismiss,
            $ok;

        this.browser = browser;
        this.$modal = config.$urlModal;

        loaderConfig =
            {
                $widgetParent: this.$modal.find('.modal-body')
            };

        this.loader = new app.FileLoadWidget(loaderConfig, new app.FileLoadManager());
        this.loader.customizeLayout(function ($parent) {

            $parent.find('.igv-flw-input-container').each(function (ii) {
                var $outer;

                $outer = $(this);
                if (0 === ii) {
                    $outer.hide();
                } else {
                    $outer.find('.igv-flw-input-row').each(function (jj) {
                        var $inner;

                        $inner = $(this);
                        if (0 === jj) {
                            $inner.find('.igv-flw-input-label').text('Session URL');
                        } else {
                            $inner.hide();
                        }
                    });
                }

            });

        });

        // upper dismiss - x - button
        $dismiss = this.$modal.find('.modal-header button:nth-child(1)');
        $dismiss.on('click', function () {
            self.loader.dismiss();
        });

        // lower dismiss - close - button
        $dismiss = this.$modal.find('.modal-footer button:nth-child(1)');
        $dismiss.on('click', function () {
            self.loader.dismiss();
        });

        // ok - button
        $ok = this.$modal.find('.modal-footer button:nth-child(2)');
        $ok.on('click', function () {
            self.okHandler();
        });

        // Dropbox
        this.dropboxController = new app.DropboxController(browser, config.$dropboxModal);
        this.dropboxController.configure(function (loader, $modal) {
            let session;

            if (loader.fileLoadManager.dictionary.data) {
                session = loader.fileLoadManager.dictionary.data.split('?')[0];
                self.browser.loadSession(session);
                loader.dismiss();
                $modal.modal('hide');
            } else {
                loader.presentErrorMessage('Error: No data file');
            }

        });

    };

    app.SessionModalController.prototype.okHandler = function () {

        if (this.loader.fileLoadManager.dictionary.data) {
            this.browser.loadSession(this.loader.fileLoadManager.dictionary.data);
            this.loader.dismiss();
            this.$modal.modal('hide');
        } else {
            this.loader.presentErrorMessage('Error: No data file');
        }

    };

    return app;
})(app || {});
