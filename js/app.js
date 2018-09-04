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
                    apiKey: "AIzaSyDUUAUFpQEN4mumeMNIRWXSiTh5cPtUAD0"
                },

            clientId: "661332306814-8nt29308rppg325bkq372vli8nm3na14.apps.googleusercontent.com",

            //urlShortener: bitlyShortener("76670dc60b519eaf9be4fc1c227b4f3e3b3a5e26"),
            urlShortener: googleShortener("AIzaSyDUUAUFpQEN4mumeMNIRWXSiTh5cPtUAD0")

        };


    main($('#igv-app-container'), config);
});
