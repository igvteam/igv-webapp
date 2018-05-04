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

    app.GenomeController = function (browser, config) {
        this.$dropdown_menu = config.$dropdown_menu;
    };

    app.GenomeController.prototype.getGenomes = function () {
        var self = this;

        return igv.xhr
            .loadJson(app.GenomeController.defaultGenomeURL, {})
            .then(function (list) {
                self.genomes = {};
                list.forEach(function (json) {
                    var $button;

                    self.genomes[ json.id ] = json;

                    $button = createButton(json.id);
                    self.$dropdown_menu.append($button);
                    $button.on('click', function () {
                        var key;
                        key = $(this).text();
                        igv.browser.loadGenome( self.genomes[ key ] );
                        app.trackLoadController.createEncodeTable(self.genomes[ key ].id);
                    });
                });
            })
    };

    app.GenomeController.defaultGenomeURL = 'https://s3.amazonaws.com/igv.org.genomes/genomes.json';

    function createButton (title) {
        var $button;

        $button = $('<button>', { class:'dropdown-item', type:'button' });
        $button.text(title);

        return $button;
    }

    return app;
})(app || {});
