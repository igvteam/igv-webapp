var igvwebConfig = {

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
    notifications: {
        googleDrive: {
            text: "Google Drive integration will be deprecated in a future version of IGV-Web. Please consider using alternative file loading methods like local files, URLs, or Dropbox.",
            flag: googleDeprecationWarningShown
        },
        dropbox: {
            text: "Cannot connect to Dropbox",
            flag: dropboxWarningShown
        }
    },

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
