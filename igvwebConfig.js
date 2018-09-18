/**
 * Configuration file for igv-webapp.   This is intentionally not a module so it can be used pre and post webpacking
 */

"use strict";

var igvwebConfig = {

    genomes: "https://s3.amazonaws.com/igv.org.genomes/genomes.json",

    trackRegistryFile: "resources/tracks/trackRegistry.json",

    igvConfig:
        {
            queryParametersSupported: true,
            showChromosomeWidget: true,
            genome: "hg19",
            apiKey: "API_KEY"
        },

    clientId: "CLIENT_ID",

    urlShortener: {
        provider: "bitly",
        apiKey: "BITLY_TOKEN"
    }

    // urlShortener: {
    //     provider: "google",
    //     apiKey: "API_KEY"
    // }

}

