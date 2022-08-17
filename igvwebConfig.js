var igvwebConfig = {

    genomes: "resources/genomes.json",
    trackRegistryFile: "resources/tracks/trackRegistry.json",
    sessionRegistryFile: "resources/sessions/sessionRegistry.json",

    // Supply a drobpox api key to enable the Dropbox file picker in the load menus.  This is optional
    //dropboxAPIKey: "...",

    // Supply a Google client id to enable the Google file picker in the load menus.  This is optional
    //clientId: "...",
    // apiKey: "...",

    // Provide a URL shorterner function or object.   This is optional.  If not supplied
    // sharable URLs will not be shortened .
    urlShortener: {
        provider: "tinyURL"
    },

    enableCircularView: true,

    igvConfig:
        {
            genome: "hg19",
            locus: "chr8:125,435,405-133,904,633",
            genomeList: "resources/genomes.json",
            queryParametersSupported: true,
            showChromosomeWidget: true,
            showSVGButton: false,
            tracks:
                [
                    {
                        id: "jb-interactions",
                        type: "interact",
                        name: "Contacts",
                        height: 125,
                        features:
                            [

                            ],   // ! Important, signals track that features will be supplied explicitly
                        order: 10000  // Just above gene track
                    }

                ]
        },

    juiceboxConfig:
        {
            "url": "https://hicfiles.s3.amazonaws.com/hiseq/gm12878/dilution/combined.hic",
            "name": "GM12878",
            "state": "8,8,6,5019.8614387040925,5017.416175745596,640,640,1.7275014631202374,NONE",
            "colorScale": "568,255,0,0",
            "nvi": "11664249584,33929",
            "tracks":
                [
                    {
                        "url": "https://www.encodeproject.org/files/ENCFF817TXQ/@@download/ENCFF817TXQ.bedpe.gz",
                        "name": "HAP-1 HiC",
                        "color": "rgb(180,25,137)"
                    }
                ],
            mapMenu:
                {
                    id: 'contact-map-datalist',
                    items: 'https://aidenlab.org/juicebox/res/hicfiles.json'
                },

        }

}

