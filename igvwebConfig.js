var igvwebConfig = {

    // URL to genomes json file
    genomes: "https://igv.org/genomes/genomes3.json",

    // URL to a track registry file
    trackRegistryFile: "resources/tracks/trackRegistry.json",

    // Supply a drobpox api key to enable the Dropbox file picker in the load menus.  This is optional
    // dropboxAPIKey: 'your dropbox API key',

    // Supply a Google client id to support Google Cloud Storage, and optionally Google Drive.  This is optional
    // clientId: "your Google client id",

    // Enable Google Drive support.  If enabled you must supply a clientId, apiKey, and appId
    //  googleDriveEnabled: true,
    //  apiKey: "your Google api key",
    //  appId: "your Google app ID",    // The Google project number

    // Provide a URL shorterner function or object.   This is optional.  If not supplied
    // sharable URLs will not be shortened.  If using tinyURL supply an api token
    // urlShortener: {
    //     provider: "tinyURL",
    //    api_token: "your tinyURL api token"
    //},

    enableCircularView: true,

    restoreLastGenome: true,

    // Uncomment to enable websocket support.
    //enableWebsocket: true,

    igvConfig:
        {
            genome: "hg38",
            locus: "all",
            loadDefaultGenomes: false,
            queryParametersSupported: true,
            showChromosomeWidget: true,
            showSVGButton: false,
            tracks: []
        }

}
