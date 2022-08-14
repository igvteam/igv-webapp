/**
 * Defines callbacks for jb <-> igv locus change synchronization
 */

let igvLocusChangeTS = 0
let jbLocusChageTS = 0


/**
 * IGV locus change -- update juicebox
 */
function igvLocusChange(hicBrowser, igvBrowser) {
    return (referenceFrameList) => {
        if (Date.now() - jbLocusChageTS < 1000) return
        igvLocusChangeTS = Date.now()
        const locusString = referenceFrameList.map(rf => `${rf.chr}:${Math.max(1, Math.ceil(rf.start))}-${Math.floor(rf.end)}`).join(' ')
        hicBrowser.parseGotoInput(locusString)
    }
}

/**
 * Juicebox locus change -- update IGV
 *
 * TODO -- there is too much access to hicBrowser state here, there should be a single API call to get the needed
 * TODO -- state but none of the existing calls have everything needed.
 */
function juiceboxLocusChange(hicBrowser, igvBrowser) {
    return (evt) => {

        if (Date.now() - igvLocusChangeTS < 100) {
            return
        }

        jbLocusChageTS = Date.now()
        const gs1 = hicBrowser.genomicState('x')
        const gs2 = hicBrowser.genomicState('y')
        const chr1 = igvBrowser.genome.getChromosomeName(gs1.chromosome.name)
        const chr2 = igvBrowser.genome.getChromosomeName(gs2.chromosome.name)
        const start1 = Math.max(0, gs1.startBP)
        const start2 = Math.max(0, gs2.startBP)

        // Bug in juicebox genomic state
        const end1 = Math.min(gs1.endBP, gs1.chromosome.size)
        const end2 = Math.min(gs2.endBP, gs2.chromosome.size)

        const ss = Math.min(start1, start2)
        const ee = Math.max(end1, end2)

        const rf1 = igvBrowser.referenceFrameList.find(rf => rf.chr === chr1)
        const rf2 = igvBrowser.referenceFrameList.find(rf => rf.chr === chr2)

        if (rf1 && rf2) {

            const width = igvBrowser.calculateViewportWidth(igvBrowser.referenceFrameList.length)

            if (chr1 === chr2) {
                rf1.start = ss
                const bpp = (ee - ss) / width
                const r = bpp / rf1.bpPerPixel
                if (r > 1.05 || r < 0.95) {
                    rf1.bpPerPixel = bpp
                }
            } else {
                rf1.start = start1
                let bpp = (end1 - start1) / width
                let r = bpp / rf1.bpPerPixel
                if (r > 1.05 || r < 0.95) {
                    rf1.bpPerPixel = bpp
                }
                rf2.start = start2
                bpp = (end2 - start2) / width
                r = bpp / rf2.bpPerPixel
                if (r > 1.05 || r < 0.95) {
                    rf2.bpPerPixel = bpp
                }
            }

            igvBrowser.updateViews()
        } else {
            const locus = chr1 === chr2 ?
                `${chr1}:${ss + 1}-${ee}` :
                `${chr1}:${start1 + 1}-${end1} ${chr2}:${start2 + 1}-${end2}`
            igvBrowser.search(locus)
        }
    }
}

export {igvLocusChange, juiceboxLocusChange}


