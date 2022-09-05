/**
 * Defines jb crosshairs -> igv interaction.  Each axis of the crosshair becomes a region of interest in IGV.
 *
 * TODO -- this seems to work but is inefficient.  Ideally we could keep a pointer to a pair of ROI features in igv
 * TODO -- and just update their coordinates here
 *
 * @param hicBrowser
 * @param igvBrowser
 * @returns {(function(*): void)|*}
 */

import juicebox from '../../node_modules/juicebox.js/js/index.js'

export default function juiceboxCrosshairsHandler(hicBrowser, igvBrowser) {
    return (s) => {

        const binSize = juicebox.getSyncState(hicBrowser.dataset, hicBrowser.state).binSize
        const gsx = hicBrowser.genomicState('x')
        const gsy = hicBrowser.genomicState('y')

        const roi1 = {chr: gsx.chromosome.name, start: s.xBP - binSize / 2, end: s.xBP + binSize / 2}
        const roi2 = {chr: gsy.chromosome.name, start: s.yBP - binSize / 2, end: s.yBP + binSize / 2}
        igvBrowser.clearROIs()
        igvBrowser.loadROI({color: "rgba(50,0,250,0.2)", features: [roi1, roi2]})
    }
}
