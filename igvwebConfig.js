/**
 * Configuration file for igv-webapp.   This is intentionally not a module so it can be used pre and post webpacking
 */

"use strict";

var igvwebConfig = {

    genomes: "resources/genomes.json",

    trackRegistryFile: "resources/tracks/trackRegistry.json",

    embedTarget: 'https://igv.org/web/release/2.0.1/embed.html',

    igvConfig:
        {
            queryParametersSupported: true,
            showChromosomeWidget: true,

            genome: "hg19",
            apiKey: "AIzaSyDUUAUFpQEN4mumeMNIRWXSiTh5cPtUAD0"
        },

<<<<<<< HEAD
    // Supply a Google client id to enable the Google file picker in the load menus.  This is optional
    clientId: "CLIENT_ID",
=======
    clientId: "661332306814-8nt29308rppg325bkq372vli8nm3na14.apps.googleusercontent.com",
>>>>>>> session load/save build out.

    // Provide a URL shorterner function or object.   This is optional.  If not supplied sharable URLs will not
    // be shortened but will be usable.
    urlShortener: {
        provider: "bitly",
        apiKey: "76670dc60b519eaf9be4fc1c227b4f3e3b3a5e26"
    }

    // urlShortener: {
    //     provider: "google",
    //     apiKey: "API_KEY"
    // }

}

