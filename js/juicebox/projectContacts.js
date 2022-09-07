/**
 * "project" significant contact records onto a special igv interaction track created to display them as arcs.
 *
 * TODO -- define what is "significant", perhaps with user input.
 */

import juicebox from '../../node_modules/juicebox.js/js/index.js'
import {StringUtils} from '../../node_modules/igv-utils/src/index.js'

let diagonalBinThreshold = 10
let percentileThreshold = 2
let alphaModifier = 0.5

async function projectContacts({ hicBrowser, igvBrowser, diagonalBinThresholdValue, percentileThresholdValue, alphaModifierValue }) {

    const config =
        {
            viewWidth: hicBrowser.contactMatrixView.getViewDimensions().width,
            dataset: hicBrowser.dataset,
            state: hicBrowser.state,
            colorScale: hicBrowser.contactMatrixView.colorScale,
            genome: igvBrowser.genome,
            diagonalBinThresholdValue,
            percentileThresholdValue,
            alphaModifierValue
        }

    const features = await createFeatureList(config)

    const tracks = igvBrowser.findTracks("id", "jb-interactions")
    if (tracks.length > 0) {
        const interactionTrack = tracks[0]
        interactionTrack.featureSource.updateFeatures(features)
        interactionTrack.clearCachedFeatures()
        interactionTrack.updateViews()
    }
}

async function createFeatureList({ viewWidth, dataset, state, colorScale, genome, diagonalBinThresholdValue, percentileThresholdValue, alphaModifierValue }) {

    diagonalBinThreshold = diagonalBinThresholdValue
    percentileThreshold = percentileThresholdValue
    alphaModifier = alphaModifierValue

    const syncState = juicebox.getSyncState(dataset, state)

    const records = await dataset.getContactRecordsWithSyncState(syncState, (state.normalization || 'NONE'), viewWidth)

    console.log(`createFeatureList - contactRecords(${StringUtils.numberFormatter(records.length)})`)

    const counts = []
    for (let rec of records) {
        if (Math.abs(rec.bin1 - rec.bin2) > diagonalBinThreshold) {
            counts.push(rec.counts)
        }
    }

    const { chr1Name, chr2Name, binSize } = syncState
    const features = []
    const threshold = percentile(counts, 100-percentileThreshold)

    for (const { bin1, bin2, counts } of records) {

        // Skip diagonal
        if (Math.abs(bin1 - bin2) <= diagonalBinThreshold) continue

        if (counts < threshold) continue

        const { red, green, blue, alpha } = colorScale.getColor(counts)
        const rgba = `rgba(${red},${green},${blue},${alphaModifier * alpha / 255})`

        features.push({
            chr1: genome.getChromosomeName(chr1Name),
            start1: bin1 * binSize,
            end1: bin1 * binSize + binSize,
            chr2: genome.getChromosomeName(chr2Name),
            start2: bin2 * binSize,
            end2: bin2 * binSize + binSize,
            value: counts,
            color: rgba
        })

        if (chr1Name !== chr2Name) {
            features.push({
                chr2: genome.getChromosomeName(chr1Name),
                start2: bin1 * binSize,
                end2: bin1 * binSize + binSize,
                chr1: genome.getChromosomeName(chr2Name),
                start1: bin2 * binSize,
                end1: bin2 * binSize + binSize,
                value: counts,
                color: rgba
            })
        }

        for (let feature of features) {
            feature.chr = feature.chr1
            feature.start = Math.min(feature.start1, feature.start2)
            feature.end = Math.max(feature.end1, feature.end2)
        }
    }

    console.log(`createFeatureList - contactRecords(${StringUtils.numberFormatter(records.length)}) features(${StringUtils.numberFormatter(features.length)})`)

    return features

}

function percentile(array, p) {

    if (array.length === 0) return undefined
    const k = Math.floor(array.length * ((100 - p) / 100))

    array.sort(function (a, b) {
        return b - a
    })
    return array[k]

}

export { projectContacts, createFeatureList }
