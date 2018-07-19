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

        this.dataExtensions =
            {
                bam: { index: 'bai', optional: false },
                any: { index: 'idx', optional: true  },
                 gz: { index: 'tbi', optional: true  }
            };

        this.indexExtensions =
            {
                bai: 'bam',
                idx: 'any',
                tbi: 'gz'
            }
    };

    app.MultiSelectTrackLoadController.prototype.ingestLocalFiles = function ($input) {
        let self = this,
            input;

        input = $input.get(0);
        if (input.files && input.files.length > 0) {

            // discard current contents of modal body
            this.$modal_body.empty();

            Array.from(input.files).forEach(function (file) {
                let name,
                    extension,
                    str,
                    blurb,
                    $p;

                name = igv.getFilename(file);
                extension = igv.getExtension({ url: file });
                if (self.indexExtensions[ extension ]) {
                    str = '';
                } else {
                    str = igv.knownFileExtensions.has(extension) ? 'known format' : 'unknown format';
                }

                blurb = 'ingest files ' + name + ' ext ' + extension + ' ' + str;
                console.log(blurb);

                $p = $('<p>');
                $p.text(blurb);
                self.$modal_body.append($p);


            });

            this.$modal.modal('show');
        }
    };

    return app;

})(app || {});