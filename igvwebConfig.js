var igvwebConfig = {

    genomes: "https://igv.org/genomes/genomes3.json",
    trackRegistryFile: "resources/tracks/trackRegistry.json",

    // Supply a drobpox api key to enable the Dropbox file picker in the load menus.  This is optional
    dropboxAPIKey: 'e43594OGdsaWp3eWFvOWZxOHdl',

    // Supply a Google client id to support Google Cloud Storage, and optionally Google Drive.  This is optional
    clientId: "Z_%%12NTkxNTk1NjcyNjAyLWNsYXNwaHB1b3Jqc3I1c2gyNHU2YWF0NGk1dnZydGU2LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29t",

    // Enable Google Drive support.  Default is false, if enabled you must supply a clientId and apiKey
    googleDriveEnabled: true,
    apiKey: "AIzaSyAQ6aQY3rDBh2XEth2PRC0YJn4Q8czc2N8",
    appId: "591595672602",    // The Google project number

    // Provide a URL shorterner function or object.   This is optional.  If not supplied
    // sharable URLs will not be shortened.  If using tinyURL supply an api token
    urlShortener: {
        provider: "tinyURL",
        api_token: "ll4539eTBiNHl3cm1ONGcwc0UwUmFqUkY5akNYOEUxVE9JRTEzSUdkREtYQW1BNnI3QnIyaVd3dHlvT1AxakxD"
    },

    corsProxy: "https://igv.org/services/igvProxy.php",

    enableCircularView: true,

    restoreLastGenome: true,

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
