
import {bitlyShortener, googleShortener} from "./urlShortener";

export const config =

    {

        genomes: "https://s3.amazonaws.com/igv.org.genomes/genomes.json",

        igvConfig:
            {
                queryParametersSupported: true,
                showChromosomeWidget: true,
                genome: "hg19",
                apiKey: "API_KEY"
            },

        clientId: "CLIENT_ID",

        urlShortener: bitlyShortener("BITLY_TOKEN"),
        //urlShortener: googleShortener("API_KEY")

    };

