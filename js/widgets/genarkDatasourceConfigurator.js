
// accession	assembly	scientific name	common name	taxonId	GenArk clade
import {genarkParser} from "./genarkParser.js"

const genarkColumns =
    [
        'accession',
        'assembly',
        'scientificName',
        'commonName',
        'taxonId',
        'genArkClade',

    ]

function genarkDatasourceConfigurator() {

    const url = 'https://hgdownload.soe.ucsc.edu/hubs/UCSC_GI.assemblyHubList.txt'

    return {
        isJSON: false,
        url,
        columns: genarkColumns,
        columnDefs:
            {
                accession: {title: 'Accession'},
                assembly: {title: 'Assembly'},
                scientificName: {title: 'Scientific Name'},
                commonName: {title: 'Common Name'},
                genArkClade: {title: 'GenArk clade'},
            },

        parser: genarkParser

    }
}

export {genarkDatasourceConfigurator, genarkColumns}
