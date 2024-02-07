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

    restoreLastGenome: true,

    igvConfig:
        {
            genome: "hg19",
            // locus: "all",
            locus: '1:67,655,272-67,684,468',
            genomeList: "resources/genomes.json",
            queryParametersSupported: true,
            showChromosomeWidget: true,
            showSVGButton: false,

            showROITableButton: true,

            roi:
                [
                    {
                        name: 'ROI set 1',
                        url: 'https://s3.amazonaws.com/igv.org.test/data/roi/roi_bed_1.bed',
                        indexed: false,
                        color: "rgba(94,255,1,0.25)"
                    },
                    {
                        name: "ROI set 2",
                        color: "rgba(3,52,249,0.25)",
                        features: [
                            {
                                chr: "chr1",
                                start: 67670000,
                                end: 67671080,
                                name: 'Set 2 feature 1'
                            },
                            {
                                chr: "chr1",
                                start: 67672095,
                                end: 67673993
                            },
                            {
                                chr: "chr1",
                                start: 67674681,
                                end: 67675237
                            },
                            {
                                chr: "chr1",
                                start: 67676055,
                                end: 67676710
                            },
                            {
                                chr: "chr1",
                                start: 67677561,
                                end: 67677888
                            },
                            {
                                chr: "chr1",
                                start: 67679263,
                                end: 67679394
                            },
                            {
                                chr: "chr1",
                                start: 67679950,
                                end: 67680180
                            },
                            {
                                chr: "chr1",
                                start: 67681849,
                                end: 67682340
                            }
                        ]
                    }
                ],
            
            tracks:
                [
                    {
                        name: 'Some features',
                        url: 'https://s3.amazonaws.com/igv.org.test/data/roi/some_features.bed',
                        indexed: false,
                        roi:
                            [
                                {
                                    name: 'Track Based ROI Set',
                                    url: 'https://s3.amazonaws.com/igv.org.test/data/roi/roi_bed_2.bed',
                                    indexed: false,
                                    color: "rgba(255,1,199,0.25)"
                                },
                            ]
                    }
                ]
        }

}
