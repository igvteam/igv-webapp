/**
 * "project" significant contact records onto a special igv interaction track created to display them as arcs.
 *
 * TODO -- define what is "significant", perhaps with user input.
 */


let diagonalBinThreshold = 10
let percentileThreshold = 2
let alphaModifier = 0.5

async function projectContacts({ hicBrowser, igvBrowser, diagonalBinThresholdValue, percentileThresholdValue, alphaModifierValue }) {

    diagonalBinThreshold = diagonalBinThresholdValue
    percentileThreshold = percentileThresholdValue
    alphaModifier = alphaModifierValue

    const { width } = hicBrowser.contactMatrixView.getViewDimensions()
    const syncState = hicBrowser.getSyncState()
    const records = await hicBrowser.dataset.getContactRecordsWithSyncState(syncState, (hicBrowser.state.normalization || 'NONE'), width)

    // Count statistics
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

        const { red, green, blue, alpha } = hicBrowser.contactMatrixView.colorScale.getColor(counts)
        const rgba = `rgba(${red},${green},${blue},${alphaModifier * alpha / 255})`

        features.push({
            chr1: igvBrowser.genome.getChromosomeName(chr1Name),
            start1: bin1 * binSize,
            end1: bin1 * binSize + binSize,
            chr2: igvBrowser.genome.getChromosomeName(chr2Name),
            start2: bin2 * binSize,
            end2: bin2 * binSize + binSize,
            value: counts,
            color: rgba
        })

        if (chr1Name !== chr2Name) {
            features.push({
                chr2: igvBrowser.genome.getChromosomeName(chr1Name),
                start2: bin1 * binSize,
                end2: bin1 * binSize + binSize,
                chr1: igvBrowser.genome.getChromosomeName(chr2Name),
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

    const tracks = igvBrowser.findTracks("id", "jb-interactions")
    if (tracks.length > 0) {
        const interactionTrack = tracks[0]
        interactionTrack.featureSource.updateFeatures(features)
        interactionTrack.clearCachedFeatures()
        interactionTrack.updateViews()
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

export {projectContacts}
