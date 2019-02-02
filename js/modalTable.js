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

class ModalTable {

    constructor (config) {

        this.config = config;
        this.datasource = config.datasource;
        this.browserHandler = config.browserHandler;

        teardownModalDOM(config);

        this.$table = $('<table cellpadding="0" cellspacing="0" border="0" class="display"></table>');
        config.$modalBody.append(this.$table);

        this.$modal = config.$modal;

        this.doBuildTable = true;

        this.$spinner = $('<div class="igv-viewport-spinner">');
        this.$table.append(this.$spinner);
        this.stopSpinner();

        this.$spinner.append(igv.createIcon("spinner"));

        let self = this;

        config.$modalTopCloseButton.on('click', function () {
            self.stopSpinner();
            $('tr.selected').removeClass('selected');
        });

        config.$modalBottomCloseButton.on('click', function () {
            self.stopSpinner();
            $('tr.selected').removeClass('selected');
        });

        config.$modal.on('hidden.bs.modal', function (e) {
            self.stopSpinner();
            $('tr.selected').removeClass('selected');

        });
    }

    startSpinner() {
        this.$spinner.addClass("fa5-spin");
        this.$spinner.show();
    }

    stopSpinner() {
        this.$spinner.hide();
        this.$spinner.addClass("fa5-spin");
    }

    async linearizedLoadData(genomeId) {

        let assembly = ModalTable.getAssembly( genomeId);

        if (undefined === assembly) {
            return undefined;
        }

        try {
            return this.datasource.retrieveData(assembly);

        } catch(error) {
            this.stopSpinner();
            this.buildTable(false);
            alert(error);
        }

    }

    buildTableWithData(data) {
        this.datasource.data = data;
        this.buildTable(true);
    }

    buildTable(success) {

        var self = this;

        this.startSpinner();
        
        if (true === success) {

            this.config.$modal.on('shown.bs.modal', function (e) {

                if (true === self.doBuildTable) {
                    self.tableWithDataAndColumns(self.datasource.tableData(self.datasource.data), self.datasource.tableColumns());
                    self.doBuildTable = false;
                }
                self.stopSpinner();
            });

            this.config.$modalGoButton.on('click', function () {
                var selected;

                selected = getSelectedTableRowsData.call(self, self.$dataTables.$('tr.selected'));

                if (selected) {
                    self.browserHandler(selected);
                }

            });

        }

        // this.config.$modalTopCloseButton.on('click', function () {
        //     self.stopSpinner();
        //     $('tr.selected').removeClass('selected');
        // });
        //
        // this.config.$modalBottomCloseButton.on('click', function () {
        //     self.stopSpinner();
        //     $('tr.selected').removeClass('selected');
        // });

    }

    tableWithDataAndColumns(tableData, tableColumns) {

        var config;

        config =
            {
                data: tableData,
                columns: tableColumns,

                // autoWidth: false,
                autoWidth: true,

                paging: true,

                lengthMenu:
                    [
                        100,
                        250,
                        500,
                        750,
                        1000
                    ],
                pageLength: 1000,

                scrollX: true,
                scrollY: '400px',
                scroller: true,
                scrollCollapse: true
            };

        this.$dataTables = this.$table.dataTable(config);
        this.$table.find('tbody').on('click', 'tr', function () {

            if ($(this).hasClass('selected')) {
                $(this).removeClass('selected');
            } else {
                $(this).addClass('selected');
            }

        });

    }

    static getAssembly(genomeID) {
        let lut,
            assembly;

        lut =
            {
                dm3: 'dm3',
                mm10: 'mm10',
                hg19: 'hg19',
                hg38: 'GRCh38'
            };

        assembly = lut[ genomeID ];

        return assembly;
    }

}

function teardownModalDOM(configuration) {

    var list;

    list =
        [
            configuration.$modal,
            configuration.$modalTopCloseButton,
            configuration.$modalBottomCloseButton,
            configuration.$modalGoButton
        ];

    list.forEach( function ($e) {
        $e.unbind();
    });

    configuration.$modalBody.empty();
}

function getSelectedTableRowsData($rows) {

    var self = this,
        dt,
        result;

    result = [];
    if ($rows.length > 0) {

        $rows.removeClass('selected');

        dt = self.$table.DataTable();
        $rows.each(function() {
            result.push( self.datasource.dataAtRowIndex(self.datasource.data, dt.row(this).index()) );
        });
    }

    return result.length > 0 ? result : undefined;
}

export default ModalTable;
