/*
const customTrackDatasourceConfigurator = genomeId => {

    return {
        isJSON: false,
        genomeId,
        dataSetPath: undefined,
        addIndexColumn: false,
        columns:
        [
	    'id',
            'library_id',
	    'project',
	    'project_alt',
	    'group',
	    'date',
	    'indexes',
	    'provider',
	    'subject',
	    'sampling_time',
	    'amount_starting_cells',
	    'tags',
	    'notes',
	    'scrna_seq_id',
	    'scvdj_seq_id',
	    'immunoprecipitate_anti_igg',
	    'immunoprecipitate_input_dna',
	    'immunoprecipitate',
	    'subject_id',
	    'created_at',
	    'updated_at',
	    'hospital',
	    'protocol',
	    'application',
	    'operator',
	    'organ_of_origin',
	    'tissue_source_origin_area',
	    'sample_type',
	    'tissue',
	    'disease',
	    'disease_subtype',
	    'cell',
	    'culture',
	    'datatype',
            'HREF',         // hide
            ],
	hiddenColumns:
        [
            'HREF'
        ],
        parser: function(str, columnDictionary, addIndexColumn) {
	    const keys = Object.keys(columnDictionary);
	    let records = Papa.parse(str, {
		delimiter: ",",
		quoteChar: '"',
		skipEmptyLines: true,
		header: true
	    }).data;
	    records.forEach( row => {
		row['HREF']=`${this.dataSetPathPrefix}${row['HREF']}`;
	    });

	    return records;
	},
        selectionHandler: selectionList => {
            return selectionList.map(({ name, HREF }) => {
                return { name, url: HREF }
            })
        }

    }
}

var customWidgets = [
	{id:'igvappcustommaporganoidsmodal',
	 configurator: customTrackDatasourceConfigurator
	},
	{id:'igvappcustommapfightcancermodal',
	 configurator: customTrackDatasourceConfigurator
	}
    ]

*/
var igvwebConfig = {
    genomes: "resources/genomes.json",
    trackRegistryFile: "resources/tracks/trackRegistry.json",
    igvConfig:
        {
            queryParametersSupported: true,
            showChromosomeWidget: true,
            genome: "hg19",
            showSVGButton: false,
            tracks: [
                // TODO -- add default tracks here.  See github.com/igvteam/igv.js/wiki for details
                // {
                //     name: "CTCF - string url",
                //     type: "wig",
                //     format: "bigwig",
                //     url: "https://www.encodeproject.org/files/ENCFF563PAW/@@download/ENCFF563PAW.bigWig"
                // }
            ]
        },

    // Provide a URL shorterner function or object.   This is optional.  If not supplied
    // sharable URLs will not be shortened .
    urlShortener: {
        provider: "tinyURL"
    },
    customWidgets: [] // or customWidgets defined above.
};
