import {main} from './main.js';
import {bitlyShortener, googleShortener} from './urlShortener.js';

$(document).ready(() => {

    // Use some variables to prevent webpack or other optimiziers from removing the factory functions.  These can be set
    // by users after post packaging.

    const f1 = bitlyShortener;
    const f2 = googleShortener;

    const config =
        {

            genomes: "https://s3.amazonaws.com/igv.org.genomes/genomes.json",

            igvConfig:
                {
                    queryParametersSupported: true,
                    showChromosomeWidget: true,
                    genome: "hg19",
                    apiKey: "API_KEY"
                },

            clientId: "CLIENT_ID",

            urlShortener: bitlyShortener("BITLY_TOKEN"),
            //urlShortener: googleShortener("API_KEY")

        };


    main($('#igv-app-container'), config);
});
