var igvwebConfig = {

    genomes: "resources/genomes.json",

    trackRegistryFile: "resources/tracks/trackRegistry.json",

    embedTarget: 'https://igv.org/web/release/2.2.0/embed.html',

    igvConfig:
        {
            queryParametersSupported: true,
            showChromosomeWidget: true,
            genome: "hg19",
            showSVGButton: false,
            apiKey: "AIzaSyCEmqU2lrAgKxJCbnJX87a5F3c9GejCCLA"
        },

    // Supply a Google client id to enable the Google file picker in the load menus.  This is optional
    clientId: "661332306814-fmasnut050v7qds33tsa2rtvd5tc06sl.apps.googleusercontent.com",

    // Provide a URL shorterner function or object.   This is optional.  If not supplied sharable URLs will not
    // be shortened but will be usable.
    urlShortener: {
        provider: "tinyURL"
    }


};
