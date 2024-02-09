/**
 * Factory function to create a configuration object for the EncodeTrackDatasource given a genomicId and type
 * @param genomeId
 * @param type - 'signals' | 'other
 * @returns {{genomeId: *, selectionHandler: (function(*): *|Uint8Array|BigInt64Array|{color, name, url}[]|Float64Array|Int8Array|Float32Array|Int32Array|Uint32Array|Uint8ClampedArray|BigUint64Array|Int16Array|Uint16Array), hiddenColumns: [string, string, string], addIndexColumn: boolean, parser: undefined, isJSON: boolean, urlPrefix: string, columns: string[], dataSetPath: undefined, titles: {AssayType: string, BioRep: string, OutputType: string, TechRep: string}, suffix: *, dataSetPathPrefix: string}}
 */
function encodeTrackDatasourceConfigurator(genomeId, type) {

    const root = 'https://s3.amazonaws.com/igv.org.app/encode/'
    let url

    switch (type) {
        case 'signals-chip':
            url = `${root}${canonicalId(genomeId)}.signals.chip.txt`
            break
        case 'signals-other':
            url = `${root}${canonicalId(genomeId)}.signals.other.txt`
            break
        case 'other':
            url = `${root}${canonicalId(genomeId)}.other.txt`
            break

    }

    return {
        isJSON: false,
        url,
        sort: encodeSort,
        columns:
            [
                //'ID',           // hide
                //'Assembly',     // hide
                'Biosample',
                'AssayType',
                'Target',
                'BioRep',
                'TechRep',
                'OutputType',
                'Format',
                'Lab',
                //'HREF',         // hide
                'Accession',
                'Experiment'
            ],
        columnDefs:
            {
                AssayType: {title: 'Assay Type'},
                OutputType: {title: 'Output Type'},
                BioRep: {title: 'Bio Rep'},
                TechRep: {title: 'Tech Rep'}
            },

        rowHandler: row => {
            const name = constructName(row)
            const url = `https://www.encodeproject.org${row['HREF']}`
            const color = colorForTarget(row['Target'])
            return {name, url, color}
        }

    }
}


function supportsGenome(genomeId) {
    const knownGenomes = new Set(["ce10", "ce11", "dm3", "dm6", "GRCh38", "hg19", "mm9", "mm10"])
    const id = canonicalId(genomeId)
    return knownGenomes.has(id)
}


function canonicalId(genomeId) {

    switch (genomeId) {
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

function constructName(record) {

    let name = record["Biosample"] || ""

    if (record["Target"]) {
        name += " " + record["Target"]
    }
    if (record["AssayType"].toLowerCase() !== "chip-seq") {
        name += " " + record["AssayType"]
    }


    return name

}

// Longer form of constructName, not currently used
function _constructName(record) {
    let name = record["Cell Type"] || ""

    if (record["Target"]) {
        name += " " + record["Target"]
    }
    if (record["AssayType"] && record["AssayType"].toLowerCase() !== "chip-seq") {
        name += " " + record["AssayType"]
    }
    if (record["BioRep"]) {
        name += " " + record["BioRep"]
    }
    if (record["TechRep"]) {
        name += (record["BioRep"] ? ":" : " 0:") + record["TechRep"]
    }
    if (record["OutputType"]) {
        name += " " + record["OutputType"]
    }
    if (record["Accession"]) {
        name += " " + record["Accession"]
    }
    return name
}


function encodeSort(a, b) {
    var aa1,
        aa2,
        cc1,
        cc2,
        tt1,
        tt2

    aa1 = a['Assay Type']
    aa2 = b['Assay Type']
    cc1 = a['Biosample']
    cc2 = b['Biosample']
    tt1 = a['Target']
    tt2 = b['Target']

    if (aa1 === aa2) {
        if (cc1 === cc2) {
            if (tt1 === tt2) {
                return 0
            } else if (tt1 < tt2) {
                return -1
            } else {
                return 1
            }
        } else if (cc1 < cc2) {
            return -1
        } else {
            return 1
        }
    } else {
        if (aa1 < aa2) {
            return -1
        } else {
            return 1
        }
    }
}

function colorForTarget(target) {

    const t = target.toLowerCase()
    if (t.startsWith("h3k4")) {
        return "rgb(0,150,0)"
    } else if (t.startsWith("h3k27")) {
        return "rgb(200,0,0)"
    } else if (t.startsWith("h3k36")) {
        return "rgb(0,0,150)"
    } else if (t.startsWith("h3k9")) {
        return "rgb(100,0,0)"
    } else if (t === "ctcf") {
        return "black"
    } else {
        return undefined
    }
}


export {encodeTrackDatasourceConfigurator, supportsGenome}
