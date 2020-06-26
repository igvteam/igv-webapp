/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 The Regents of the University of California
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
 * Datasource for a modal table for browsing ENCODE resources.  The datasource is initialized with a genome ID, and
 * fetches table data from the magic url.
 */


import getDataWrapper from './dataWrapper.js'

const columns = [
    'Biosample',
    'Target',
    'Assay Type',
    'Output Type',
    'Bio Rep',
    'Tech Rep',
    'Format',
    'Experiment',
    'Accession',
    'Lab'
]

class EncodeDataSource {

    constructor(genomeId, filter, suffix) {
        this.genomeId = genomeId
        this.filter = filter
        this.suffix = suffix || ".txt"
    };

    async tableData() {
        return this.fetchData()
    };

    async tableColumns() {
        return columns;
    };

    async fetchData() {

        const id = canonicalId(this.genomeId)
        const url = "https://s3.amazonaws.com/igv.org.app/encode/" + id + this.suffix
        const response = await fetch(url)
        const data = await response.text()
        const records = parseTabData(data, this.filter)
        records.sort(encodeSort)
        return records
    }

    static supportsGenome(genomeId) {
        const knownGenomes = new Set(["ce10", "ce11", "dm3", "dm6", "GRCh38", "hg19", "mm9", "mm10"])
        const id = canonicalId(genomeId)
        return knownGenomes.has(id)
    }

}

function parseTabData(data, filter) {

    var dataWrapper,
        line;

    dataWrapper = getDataWrapper(data);

    let records = [];

    dataWrapper.nextLine();  // Skip header
    while (line = dataWrapper.nextLine()) {

        let tokens = line.split("\t");
        let record = {
            "Assembly": tokens[1],
            "ExperimentID": tokens[0],
            "Experiment": tokens[0].substr(13).replace("/", ""),
            "Biosample": tokens[2],
            "Assay Type": tokens[3],
            "Target": tokens[4],
            "Format": tokens[8],
            "Output Type": tokens[7],
            "Lab": tokens[9],
            "url": "https://www.encodeproject.org" + tokens[10],
            "Bio Rep": tokens[5],
            "Tech Rep": tokens[6],
            "Accession": tokens[11]
        };
        record["name"] = constructName(record)

        if (filter === undefined || filter(record)) {
            records.push(record);
        }
    }

    return records;
}

function constructName(record) {

    let name = record["Biosample"] || "";

    if (record["Target"]) {
        name += " " + record["Target"];
    }
    if (record["Assay Type"].toLowerCase() !== "chip-seq") {
        name += " " + record["Assay Type"];
    }
    // if (record["Bio Rep"]) {
    //     name += " " + record["Bio Rep"];
    // }
    // if (record["Tech Rep"]) {
    //     name += (record["Bio Rep"] ? ":" : " 0:") + record["Tech Rep"];
    // }
    //
    // name += " " + record["Output Type"];
    //
    // name += " " + record["Accession"];

    return name

}

function encodeSort(a, b) {
    var aa1,
        aa2,
        cc1,
        cc2,
        tt1,
        tt2;

    aa1 = a['Assay Type'];
    aa2 = b['Assay Type'];
    cc1 = a['Biosample'];
    cc2 = b['Biosample'];
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

function canonicalId(genomeId) {

    switch(genomeId) {
        case "hg38":
            return "GRCh38"
        case "CRCh37":
            return "hg19"
        case "GRCm38":
            return "mm10"
        case "NCBI37":
            return "mm9"
        case "WBcel235":
            return "ce11"
        case "WS220":
            return "ce10"
        default:
            return genomeId
    }

}

export default EncodeDataSource


