
import {StringUtils} from '../../node_modules/igv-utils/src/index.js'

class ContactProjectionDatasource {

    constructor(hicBrowser, igvGenome) {

        this.genome = igvGenome
        this.hicBrowser = hicBrowser
        this.dataset = hicBrowser.dataset
        this.diagonalBinThreshold = 10
        this.percentileThreshold = 2
        this.alphaModifier = 0.5

    }

    async getFeatures({chr, start, end}) {

        const {chr1Name, chr2Name, binSize, binX, binY, pixelSize} = this.hicBrowser.getSyncState()
        const region1 = {chr: chr1Name, start: start, end: end}
        const region2 = {chr: chr1Name, start: start, end: end}
        const normalization = this.hicBrowser.state.normalization || "NONE"
        const records = await this.hicBrowser.dataset.getContactRecords(normalization, region1, region2, "BP", binSize)

        const counts = []
        for (let rec of records) {
            if (Math.abs(rec.bin1 - rec.bin2) > this.diagonalBinThreshold) {
                counts.push(rec.counts)
            }
        }

        const features = []
        const threshold = percentile(counts, 100-this.percentileThreshold)

        for (const { bin1, bin2, counts } of records) {

            // Skip diagonal
            if (Math.abs(bin1 - bin2) <= this.diagonalBinThreshold) continue

            if (counts < threshold) continue

            features.push({
                chr1: this.genome.getChromosomeName(chr),
                start1: bin1 * binSize,
                end1: bin1 * binSize + binSize,
                chr2: this.genome.getChromosomeName(chr),
                start2: bin2 * binSize,
                end2: bin2 * binSize + binSize,
                value: counts
            })

            for (let feature of features) {
                feature.chr = feature.chr1
                feature.start = Math.min(feature.start1, feature.start2)
                feature.end = Math.max(feature.end1, feature.end2)
            }
        }

        console.log(`createFeatureList - contactRecords(${StringUtils.numberFormatter(records.length)}) features(${StringUtils.numberFormatter(features.length)})`)

        return features

    }
}

function percentile(array, p) {

    if (array.length === 0) return undefined
    const k = Math.floor(array.length * ((100 - p) / 100))

    array.sort(function (a, b) {
        return b - a
    })
    return array[k]

}

export default ContactProjectionDatasource