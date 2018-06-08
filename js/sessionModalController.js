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

var app = (function (app) {
    app.SessionModalController = function (browser, $modal) {

        let self = this,
            loaderConfig,
            $dismiss,
            $ok;

        this.browser = browser;

        loaderConfig =
            {
                hidden: false,
                embed: true,
                $widgetParent: $modal.find('.modal-body')
            };

        this.loader = browser.createFileLoadWidget(loaderConfig, new igv.FileLoadManager());

        // upper dismiss - x - button
        $dismiss = $modal.find('.modal-header button:nth-child(1)');
        $dismiss.on('click', function () {
            self.loader.dismiss();
        });

        // lower dismiss - close - button
        $dismiss = $modal.find('.modal-footer button:nth-child(1)');
        $dismiss.on('click', function () {
            self.loader.dismiss();
        });

        // ok - button
        $ok = $modal.find('.modal-footer button:nth-child(2)');
        $ok.on('click', function () {

            if (self.okHandler()) {
                self.loader.dismiss();
                $modal.modal('hide');
            }

        });

        this.loader.customizeLayout(function ($parent) {

            $parent.find('.igv-flw-input-container').each(function () {

                $(this).find('.igv-flw-input-row').each(function (index) {

                    if (1 === index) {
                        $(this).hide();
                    }

                });

            });

        });


    };

    app.SessionModalController.prototype.okHandler = function () {

        var session;

        session = this.getConfiguration();
        session = session.split('?')[ 0 ];
        if (session) {
            this.browser.loadSession(session);
        }

        return session;

    };

    app.SessionModalController.prototype.getConfiguration = function () {

        if (this.loader.fileLoadManager.dictionary.data) {
            return this.loader.fileLoadManager.dictionary.data;
        } else {
            this.loader.presentErrorMessage('Error: No data file');
            return undefined;
        }

    };

    return app;
})(app || {});
