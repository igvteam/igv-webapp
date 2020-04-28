var igvwebConfig = {

    genomes: "resources/genomes.json",

    trackRegistryFile: "resources/tracks/trackRegistry.json",

    embedTarget: 'https://igv.org/web/release/2.2.0/embed.html',

    igvConfig:
        {
            queryParametersSupported: true,
            showChromosomeWidget: true,
            genome: "hg19",
            showSVGButton: false
        },

    // Provide a URL shorterner function or object.   This is optional.  If not supplied sharable URLs will not
    // be shortened but will be usable.
    urlShortener: {
        provider: "tinyURL"
    }


};
