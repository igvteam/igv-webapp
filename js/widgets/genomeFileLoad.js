import alertSingleton from './alertSingleton.js'
import {FileUtils, igvxhr} from "../../node_modules/igv-utils/src/index.js"
import FileLoad from "./fileLoad.js"
import MultipleTrackLoadHelper from "./multipleTrackLoadHelper.js"

/**
 * Extends the FileLoad class and is designed to handle the loading of reference genome files in various formats,
 * such as JSON, hub.txt, .gbk, .2bit, or FASTA files (with an optional .fai index). It provides a constructor
 * to initialize the class and a key method, loadFiles, to process and validate the input descriptors.
 */
class GenomeFileLoad extends FileLoad {

    /**
     * Constructor for the GenomeFileLoad class.  Initializes the class with input elements and a load handler.
     *
     * @param localFileInput
     * @param dropboxButton
     * @param googleDriveButton
     * @param loadHandler
     */
    constructor({localFileInput, dropboxButton, googleDriveButton, loadHandler}) {
        super({localFileInput, dropboxButton, googleDriveButton})
        this.loadHandler = loadHandler
    }

    /**
     * Load a reference genome from JSON, hub.txt, .gbk, .2bit, or FASTA (+ optional .fai).
     * `descriptors`: array of { path: File|string, name?: string }.
     */

    async loadFiles(descriptors) {
        try {
            if (!Array.isArray(descriptors)) {
                throw new Error('Error: non\-array `descriptors` passed to GenomeFileLoad.loadFiles')
            }

            const items = descriptors.filter(d => d && d.path)
            if (items.length === 0) {
                throw new Error(`Error: no valid ` +
                    `descriptors with \`path\` provided (received=${descriptors.length})`)
            }


            // Enrich with name, lowercased name, and extension
            const files = []
            for (const d of items) {
                const name = d.name
                const lower = String(name).toLowerCase()
                const ext = (FileUtils.getExtension(name) || '').toLowerCase()
                files.push({path: d.path, name, lower, ext})
            }

            const getSize = async (path) => {
                try {
                    if (path instanceof File) {
                        return typeof path.size === 'number' ? path.size : -1
                    } else {
                        return await igvxhr.getContentLength(path)
                    }
                } catch {
                    return -1
                }
            }

            let configuration

            if (files.length === 1) {
                const {path, lower, ext} = files[0]
                if (ext === 'json') {
                    configuration = await igvxhr.loadJson(path)
                } else if (lower.endsWith('hub.txt')) {
                    configuration = {url: path}
                } else if (ext === 'gbk') {
                    configuration = {gbkURL: path}
                } else if (ext === '2bit') {
                    configuration = {twoBitURL: path}
                } else {
                    // Assume FASTA; warn for large or unknown sizes
                    const size = await getSize(path)
                    if (size > 0 && size < 10000000) {
                        configuration = {fastaURL: path}
                    } else {
                        const ok = typeof confirm === 'function'
                            ? confirm('Missing index file. This FASTA is large, or its size is unknown. Loading without an index may be slow or freeze the browser. Proceed?')
                            : false
                        if (!ok) return
                        configuration = {fastaURL: path}
                    }
                }
            } else {
                if (files.length !== 2) {
                    throw new Error('Genome did not load:  expected exactly 2 files: FASTA and .fai index')
                }

                const [a, b] = files
                if (a.lower.endsWith('.gz') || b.lower.endsWith('.gz')) {
                    throw new Error('Genome did not load:  gzipped FASTA files with indexes are not supported')
                }

                const aIsFai = a.ext === 'fai'
                const bIsFai = b.ext === 'fai'
                if (aIsFai && !bIsFai) {
                    configuration = {fastaURL: b.path, indexURL: a.path}
                } else if (bIsFai && !aIsFai) {
                    configuration = {fastaURL: a.path, indexURL: b.path}
                } else {
                    throw new Error('Genome did not load:  did not detect index file (expected extension .fai)')
                }
            }

            if (!configuration) {
                throw new Error('Genome requires either JSON, UCSC hub.txt, GenBank \".gbk\", or a FASTA & .fai index')
            }

            await this.loadHandler(configuration)
        } catch (e) {
            console.error(e)
            try {
                alertSingleton.present(e.message || String(e))
            } catch { /* no-op */
            }
        }
    }
}

export default GenomeFileLoad