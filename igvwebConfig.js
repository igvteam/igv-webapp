const igvwebConfig = {

    genomes: "resources/genomes.json",
    trackRegistryFile: "resources/tracks/trackRegistry.json",
    sessionRegistryFile: "resources/sessions/sessionRegistry.json",

    // Supply a drobpox api key to enable the Dropbox file picker in the load menus.  This is optional
   // dropboxAPIKey: '....',

    // Supply a Google client id to enable the Google file picker in the load menus.  This is optional
    //clientId: "...",

    //
    googleDriveEnabled: true,


    // Provide a URL shorterner function or object.   This is optional.  If not supplied
    // sharable URLs will not be shortened.  If using tinyURL supply an api token
    //urlShortener: {
   //    provider: "tinyURL",
   //     api_token: "..."
   // },

    enableCircularView: true,

    restoreLastGenome: true,
    
    igvConfig:
        {
            genome: "hg19",
            locus: "all",
            queryParametersSupported: true,
            showChromosomeWidget: true,
            showSVGButton: false,
            tracks: []
        }

}
