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

    app.GenomeController = function (app, browser, config) {
        var $file_input,
            $url_input;

        // local genome file
        $file_input = config.$fileModal.find('input');
        $file_input.on('change', function (e) {
            var file;

            file = ($(this).get(0).files)[0];

            // do stuff
            console.log('do stuff with ' + file.name);

            $(this).val("");
            config.$fileModal.modal('hide');

        });

        // URL genome file
        $url_input = config.$urlModal.find('input');
        $url_input.on('keyup', function (e) {
            var url;

            if (13 !== e.keyCode) {
                return;
            }

            url = $(this).val();

            // do stuff
            console.log('do stuff with ' + url.split('/').pop());

            $(this).val("");
            config.$urlModal.modal('hide');

        });

    };

    return app;
})(app || {});
