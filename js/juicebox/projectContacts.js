/**
 * "project" significant contact records onto a special igv interaction track created to display them as arcs.
 *
 * TODO -- define what is "significant", perhaps with user input.
 */



let diagonalBinThreshold = 10
let percntileThreshold = 2
let alphaModifier = 0.5

function updateContactParameters(bThreshold, pThreshold, aModifier) {
    diagonalBinThreshold = bThreshold
    percntileThreshold = pThreshold
    alphaModifier = aModifier
}

async function projectContacts(hicBrowser, igvBrowser) {

    const viewportWidth = hicBrowser.contactMatrixView.$viewport[0].clientWidth
    const {chr1Name, chr2Name, binSize, binX, binY, pixelSize} = hicBrowser.getSyncState()
    const widthInBP = viewportWidth * binSize / pixelSize
    const region1 = {chr: chr1Name, start: binX * binSize, end: binX * binSize + widthInBP}
    const region2 = {chr: chr2Name, start: binY * binSize, end: binY * binSize + widthInBP}
    const normalization = hicBrowser.state.normalization || "NONE"
    const records = await hicBrowser.dataset.getContactRecords(normalization, region1, region2, "BP", binSize)
    //console.log(records)

    // Count statistics
    const counts = []
    for (let rec of records) {
        if (Math.abs(rec.bin1 - rec.bin2) > diagonalBinThreshold) {
            counts.push(rec.counts)
        }
    }
    const threshold = percentile(counts, 100-percntileThreshold)

    const features = []
    for (let rec of records) {

        const {bin1, bin2, counts} = rec
        // Skip diagonal
        if (Math.abs(bin1 - bin2) <= diagonalBinThreshold) continue

        if (counts < threshold) continue

        const color = hicBrowser.contactMatrixView.colorScale.getColor(counts)
        const rgba = `rgba(${color.red},${color.green},${color.blue},${alphaModifier * color.alpha / 255})`

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
    const itracks = igvBrowser.findTracks("id", "jb-interactions")
    if (itracks.length > 0) {
        const interactionTrack = itracks[0]
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


export {projectContacts, updateContactParameters}