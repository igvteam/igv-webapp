import { main } from './main.js';

$(document).ready(() => {

    const config =
        {

            genomes: "https://s3.amazonaws.com/igv.org.genomes/genomes.json",

            igvConfig:
                {
                    queryParametersSupported: true,
                    showChromosomeWidget: true,
                    genome: "hg38"
                },

            googleConfig:
                {
                    apiKey: "AIzaSyDUUAUFpQEN4mumeMNIRWXSiTh5cPtUAD0",
                    clientId: "661332306814-8nt29308rppg325bkq372vli8nm3na14.apps.googleusercontent.com",
                },

            urlShortener:
                {
                    provider: "bitly",
                    // apiKey: "AIzaSyDUUAUFpQEN4mumeMNIRWXSiTh5cPtUAD0"
                }
        };


    main($('#igv-app-container'), config);
});
