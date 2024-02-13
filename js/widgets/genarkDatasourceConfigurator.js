
// accession	assembly	scientific name	common name	taxonId	GenArk clade
import {genarkParser} from "./utils/genarkParser.js"

function genarkDatasourceConfigurator() {

    const url = 'https://hgdownload.soe.ucsc.edu/hubs/UCSC_GI.assemblyHubList.txt'

    return {
        isJSON: false,
        url,
        columns:
            [
                'accession',
                'assembly',
                'scientific name',
                'common name',
                'taxonId',
                'GenArk clade',

            ],
        columnDefs:
            {
                accession: {title: 'Accession'},
                assembly: {title: 'Assembly'},
                'scientific name': {title: 'Scientific Name'},
                'common name': {title: 'Common Name'},
            },

        parser: genarkParser

    }
}

export {genarkDatasourceConfigurator}
