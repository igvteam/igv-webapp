const igvwebConfig = {

    genomes: "resources/genomes.json",
    trackRegistryFile: "resources/tracks/trackRegistry.json",
    sessionRegistryFile: "resources/sessions/sessionRegistry.json",

    // Supply a drobpox api key to enable the Dropbox file picker in the load menus.  This is optional
    //dropboxAPIKey: "...",

    // Supply a Google client id to enable the Google file picker in the load menus.  This is optional
    //clientId: "...",
    //apiKey: "...",

    // Provide a URL shorterner function or object.   This is optional.  If not supplied
    // sharable URLs will not be shortened.  If using tinyURL supply an api token
    // urlShortener: {
    //     provider: "tinyURL",
    //     api_token: "<your tinyurl token>"
    // },
    // urlShortener: function(longURL) {...   return shortendURL}

    enableCircularView: true,

    restoreLastGenome: true,

    // Configuration for user notifications that can be dismissed
    notifications:
        [
            {
                googleDrive: "<span style='font-size: large'>As of March 31, IGV-Web hosted at https://igv.org/app will no longer support " +
                    "loading files from Google Drive. Files from Google Cloud Storage will still be supported. " +
                    "If you host your own instance of IGV-Web, it can be configured to support Google Drive by using " +
                    "your Google project clientId as described at " +
                    "<a href='https://igv.org/doc/webapp/#Hosting/#configuration'>https://igv.org/doc/webapp/#Hosting/#configuration</a></span>."
            }
        ],

    igvConfig:
        {
            genome: "hg19",
            locus: "all",
            genomeList: "resources/genomes.json",
            queryParametersSupported: true,
            showChromosomeWidget: true,
            showSVGButton: false,
            tracks: []
        }

}
