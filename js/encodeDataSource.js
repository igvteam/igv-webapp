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

class EncodeDataSource {

    constructor(columns) {
        this.columns = columns;

        this.filter =  undefined //(record) => {return 'bigbed' !== record["Format"].toLowerCase();}
    }

    async retrieveData(genomeID, filter) {
        let url = "https://s3.amazonaws.com/igv.org.app/encode/" + genomeID + ".txt.gz";
        let data = await igv.xhr.loadString(url, {});
        let records = await parseTabData(data, this.filter);
        records.sort(encodeSort);
        return records;
    };

    tableData(data) {
        var self = this,
            mapped;

        mapped = data.map(function (row) {

            let displayKeys = self.columns;

            return displayKeys.map(function (key) {
                return row[key];
            })
        });

        return mapped;
    }

    tableColumns() {

        var columns;

        columns = this.columns.map(function (key) {
            const title = columnName(key);
            return {title: title}
        });

        return columns;
    }

    dataAtRowIndex(data, index) {


        let row = data[index];
        let format = getFormat(row);

        let type;
        if (format === 'bedpe-domain') {
            type = 'annotation';
        } else if (format === 'bedpe-loop') {
            type = 'interaction';
        }

        let obj =
            {
                url: row['url'],
                color: encodeAntibodyColor(row['Target']),
                name: row['Name'],
                format: format,
                type: type
            };

        return obj;

        function encodeAntibodyColor(antibody) {

            var colors,
                key;

            colors =
                {
                    DEFAULT: "rgb(3, 116, 178)",
                    H3K27AC: "rgb(200, 0, 0)",
                    H3K27ME3: "rgb(130, 0, 4)",
                    H3K36ME3: "rgb(0, 0, 150)",
                    H3K4ME1: "rgb(0, 150, 0)",
                    H3K4ME2: "rgb(0, 150, 0)",
                    H3K4ME3: "rgb(0, 150, 0)",
                    H3K9AC: "rgb(100, 0, 0)",
                    H3K9ME1: "rgb(100, 0, 0)"
                };

            if (undefined === antibody || '' === antibody || '-' === antibody) {
                key = 'DEFAULT';
            } else {
                key = antibody.toUpperCase();
            }

            return colors[key];
        }

        function getFormat(row) {

            let format = row['Format'],
                outputType = row['OutputType'],
                assayType = row['AssayType'];

            if (format === 'bedpe' && outputType && outputType.includes('domain')) {
                return 'bedpe-domain';
            } else if (format === 'tsv' && outputType.includes("interaction") && assayType.toLowerCase() === 'hic') {
                return "bedpe-loop";
            }

            else {
                return format;
            }
        }
    }

}

function parseTabData(data, filter) {

    if (!data) return null;

    const dataWrapper = igv.getDataWrapper(data);

    const records = [];

    const headerLine = dataWrapper.nextLine().split("\t");

    // Search for HREF column
    let hrefColumn = headerLine.findIndex(v => v === "HREF")
    if (hrefColumn < 0) {
        throw Error("No HREF column found.")
    }

    let line;
    while (line = dataWrapper.nextLine()) {

        const tokens = line.split("\t");

        if (tokens.length !== headerLine.length) {
            throw Error("Invalid table.  # of values != # of headers")
        }

        const record = {}
        for (let i = 0; i < headerLine.length; i++) {
            if (i !== hrefColumn) {
                const label = headerLine[i]
                record[label] = tokens[i]

            }
        }
        record["url"] = "https://www.encodeproject.org" + tokens[hrefColumn]

        constructName(record);

        if (filter === undefined || filter(record)) {
            records.push(record);
        }
    }

    return records;
}

function constructName(record) {

    let name = record["CellType"] || "";

    if (record["Target"]) {
        name += " " + record["Target"];
    }
    if (record["AssayType"].toLowerCase() !== "chip-seq") {
        name += " " + record["AssayType"];
    }
    if (record["BioRep"]) {
        name += " " + record["BioRep"];
    }
    if (record["TechRep"]) {
        name += (record["BioRep"] ? ":" : " 0:") + record["TechRep"];
    }

    name += " " + record["OutputType"];

    name += " " + record["Experiment"];

    record["Name"] = name;

}

function encodeSort(a, b) {
    var aa1,
        aa2,
        cc1,
        cc2,
        tt1,
        tt2;

    aa1 = a['AssayType'];
    aa2 = b['AssayType'];
    cc1 = a['CellType'];
    cc2 = b['CellType'];
    tt1 = a['Target'];
    tt2 = b['Target'];

    if (aa1 === aa2) {
        if (cc1 === cc2) {
            if (tt1 === tt2) {
                return 0;
            } else if (tt1 < tt2) {
                return -1;
            } else {
                return 1;
            }
        } else if (cc1 < cc2) {
            return -1;
        } else {
            return 1;
        }
    } else {
        if (aa1 < aa2) {
            return -1;
        } else {
            return 1;
        }
    }
}

function columnName(token) {
    return token.replace(/([A-Z])/g, ' $1')
}

export default EncodeDataSource;

