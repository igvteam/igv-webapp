const igvwebConfig = {

    genomes: "resources/genomes.json",
    trackRegistryFile: "resources/tracks/trackRegistry.json",
    sessionRegistryFile: "resources/sessions/sessionRegistry.json",

    // Supply a drobpox api key to enable the Dropbox file picker in the load menus.  This is optional
    dropboxAPIKey: 'e43594OGdsaWp3eWFvOWZxOHdl',

    // Supply a Google client id to enable the Google file picker in the load menus.  This is optional
    apiKey: "leawkkQUl6YVN5QVE2YVFZM3JEQmgyWEV0aDJQUkMwWUpuNFE4Y3pjMk44",
    clientId: "Z_%%12NTkxNTk1NjcyNjAyLWNsYXNwaHB1b3Jqc3I1c2gyNHU2YWF0NGk1dnZydGU2LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29t",


    // Provide a URL shorterner function or object.   This is optional.  If not supplied
    // sharable URLs will not be shortened.  If using tinyURL supply an api token
    // urlShortener: {
    //     provider: "tinyURL",
    //     api_token: "<your tinyurl token>"
    // },
    // urlShortener: function(longURL) {...   return shortendURL}

    enableCircularView: true,

    restoreLastGenome: true,
    
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
