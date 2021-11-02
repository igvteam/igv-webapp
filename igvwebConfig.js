var igvwebConfig = {

    genomes: "resources/genomes.json",
    trackRegistryFile: "resources/tracks/trackRegistry.json",

    // Supply a Google client id to enable the Google file picker in the load menus.  This is optional
    //clientId: "...",
    // apiKey: "...",

    // Provide a URL shorterner function or object.   This is optional.  If not supplied
    // sharable URLs will not be shortened .
    urlShortener: {
        provider: "tinyURL"
    },

    //restoreLastGenome: true,

    __igvConfig__:
        {
            genomeList: "resources/genomes.json",
            queryParametersSupported: true,
            showChromosomeWidget: true,
            genome: "hg38",
            showSVGButton: false,
            tracks: [
                // TODO -- add default tracks here.  See github.com/igvteam/igv.js/wiki for details
                // {
                //     name: "CTCF - string url",
                //     type: "wig",
                //     format: "bigwig",
                //     url: "https://www.encodeproject.org/files/ENCFF563PAW/@@download/ENCFF563PAW.bigWig"
                // }
            ]
        },

    // JBrowse CircularView hack
    igvConfig:
        {
            genome: "hg19",
            locus: "chr2:33,091,520-33,092,390",
            showCircularViewButton: false,
            // showCircularView: true,
            genomeList: "resources/genomes.json",
            queryParametersSupported: true,
            showChromosomeWidget: true,
            showSVGButton: false,
            tracks:
                [
                    {
                        id: 'bedpe-track',
                        name: "SKBR3 translocations",
                        url: "https://s3.amazonaws.com/igv.org.demo/SKBR3/SKBR3_Sniffles_variants_tra.bedpe",
                        color: "rgb(0,150,150)",
                        height: 100
                    },
                    {
                        id: "delly",
                        url: "https://s3.amazonaws.com/igv.org.demo/SKBR3/SKBR3_Illumina_delly.tra.pass.vcf",
                        type: "variant",
                        format: "vcf",
                        name: "delly translocations",
                        supportsWholeGenome: true,
                        visibilityWindow: -1,
                        showGenotypes: false,
                        height: 40
                    },
                    {
                        url: "https://s3.amazonaws.com/igv.org.demo/SKBR3/SKBR3_550bp_pcrFREE_S1_L001_AND_L002_R1_001.101bp.bwamem.ill.mapped.sort.bam",
                        indexURL: "https://s3.amazonaws.com/igv.org.demo/SKBR3/SKBR3_550bp_pcrFREE_S1_L001_AND_L002_R1_001.101bp.bwamem.ill.mapped.sort.bam.bai",
                        type: "alignment",
                        format: "bam",
                        name: "Alignments",
                        showMismatches: false,
                        height: 500,
                        maxFragmentLength: 1000000,
                        colorBy: "fragmentLength",
                    }
                ]
        }

}
