/**
 * Configuration file for igv-webapp.   This is intentionally not a module so it can be used pre and post webpacking
 */

"use strict";

var igvwebConfig = {

    genomes: "resources/genomes.json",

    trackRegistryFile: "resources/tracks/trackRegistry.json",

    embedTarget: 'https://igv.org/web/release/2.2.0/embed.html',

    igvConfig:
        {
            queryParametersSupported: true,
            showChromosomeWidget: true,

            genome: "hg19",

            apiKey: "API_KEY"
        },

    // Supply a Google client id to enable the Google file picker in the load menus.  This is optional
    clientId: "CLIENT_ID",

    // Provide a URL shorterner function or object.   This is optional.  If not supplied sharable URLs will not
    // be shortened but will be usable.
    urlShortener: {
        provider: "bitly",

        apiKey: "BITLY_TOKEN"
    }

    // urlShortener: {
    //     provider: "google",
    //     apiKey: "API_KEY"
    // }

};


