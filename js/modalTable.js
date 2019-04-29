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
 * Created by dat on 4/18/17.
 */


const ModalTable = function (config) {

    this.config = config;
    this.datasource = config.datasource;
    this.browserHandler = config.browserHandler;

    teardownModalDOM(config);
    this.$table = $('<table cellpadding="0" cellspacing="0" border="0" class="display"></table>');
    config.$modalBody.append(this.$table);
    this.doRetrieveData = true;
    this.doBuildTable = true;

    this.$spinner = $('<div>');
    this.$table.append(this.$spinner);

    this.$spinner.append($('<i class="fa fa-lg fa-spinner fa-spin"></i>'));
};

function teardownModalDOM(configuration) {

    var list;

    list =
        [
            configuration.$modal,
            configuration.$modalTopCloseButton,
            configuration.$modalBottomCloseButton,
            configuration.$modalGoButton
        ];

    list.forEach(function ($e) {
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
        $rows.each(function () {
            result.push(self.datasource.dataAtRowIndex(self.datasource.data, dt.row(this).index()));
        });
    }

    return result.length > 0 ? result : undefined;
}

ModalTable.prototype.startSpinner = function () {
    this.$spinner.show();
};

ModalTable.prototype.stopSpinner = function () {
    this.$spinner.hide();
};

ModalTable.prototype.hidePresentationButton = function () {
    this.config.$modalPresentationButton.addClass('igv-app-disabled');
    this.config.$modalPresentationButton.text('Genome not supported by ENCODE');
};

ModalTable.prototype.willRetrieveData = function () {
    //this.startSpinner();
    $('#hic-encode-modal-button').hide();
    $('#hic-encode-loading').show();

};

ModalTable.prototype.didRetrieveData = function () {
    //this.config.didRetrieveData();
    $('#hic-encode-modal-button').show();
    $('#hic-encode-loading').hide();
};

ModalTable.prototype.didFailToRetrieveData = function () {
    this.stopSpinner();
    this.buildTable(false);
};

ModalTable.prototype.loadData = function (genomeId) {

    var self = this,
        assembly;

    this.willRetrieveData();

    assembly = ModalTable.getAssembly(genomeId);

    if (assembly) {

        this.datasource
            .retrieveData(assembly, function (record) {
                // to bigwig only for now
                return record["Format"].toLowerCase() === "bigwig";
            })
            .then(function (data) {

                self.datasource.data = data;
                self.doRetrieveData = false;

                self.didRetrieveData();
                self.buildTable(true);

            })
            .catch(function (e) {
                self.didFailToRetrieveData();
            });
    }

};

ModalTable.prototype.buildTable = function (success) {

    var self = this;

    if (true === success) {

        this.config.$modal.on('shown.bs.modal', function (e) {

            if (true === self.doBuildTable) {
                self.tableWithDataAndColumns(self.datasource.tableData(self.datasource.data), self.datasource.tableColumns());
                self.stopSpinner();
                self.doBuildTable = false;
            }

        });

        this.config.$modalGoButton.on('click', function () {
            var selected;

            selected = getSelectedTableRowsData.call(self, self.$dataTables.$('tr.selected'));

            if (selected) {
                self.browserHandler(selected);
            }

        });

    }

    this.config.$modalTopCloseButton.on('click', function () {
        $('tr.selected').removeClass('selected');
    });

    this.config.$modalBottomCloseButton.on('click', function () {
        $('tr.selected').removeClass('selected');
    });

};

ModalTable.prototype.tableWithDataAndColumns = function (tableData, tableColumns) {

    var config;

    this.stopSpinner();
    config =
        {
            data: tableData,
            columns: tableColumns,

            autoWidth: false,

            paging: true,

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

};

ModalTable.getAssembly = function (genomeID) {
    let lut,
        assembly;

    lut =
        {
            dm3: 'dm3',
            mm10: 'mm10',
            hg19: 'hg19',
            hg38: 'GRCh38'
        };

    assembly = lut[genomeID];

    return assembly;
};


export default ModalTable
