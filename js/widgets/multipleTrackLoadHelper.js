// javascript
import alertSingleton from './alertSingleton.js'
import {FileUtils, GoogleDrive, GoogleUtils, URIUtils} from "../../node_modules/igv-utils/src/index.js"

class MultipleTrackLoadHelper {

    constructor(fileLoadHandler) {
        this.fileLoadHandler = fileLoadHandler
    }

    /**
     * Load one or more track files.
     * @param files - array of objects with 'path' and optional 'name' attributes. Path can be a File object or a URL string.
     *
     * @returns {Promise<void>}
     */
    async loadTrackFiles(files) {

        if (!Array.isArray(files) || files.length === 0) return

        const fileLoadHandler = this.fileLoadHandler

        try {
            // Search for index files  (.bai, .csi, .tbi, .idx)
            const indexLUT = new Map()
            const dataFiles = []

            for (let {path, name} of files) {

                if (!name) {
                    name = await MultipleTrackLoadHelper.getFilename(path)
                }

                const extension = (FileUtils.getExtension(name) || '').toLowerCase()

                if (indexExtensions.has(extension)) {
                    // key is the presumed data file name
                    const key = createIndexLUTKey(name, extension)
                    indexLUT.set(key, path)
                } else {
                    dataFiles.push({path, name})
                }
            }

            const configurations = []

            for (let {path, name} of dataFiles) {

                if (indexLUT.has(name)) {

                    const indexURL = indexLUT.get(name)
                    configurations.push({
                        url: path,
                        filename: name,
                        indexURL,
                        name: name,
                        _derivedName: true
                    })

                } else if (requireIndex.has((FileUtils.getExtension(name) || '').toLowerCase())) {
                    throw new Error(`Unable to load track file ${name} - you must select both ${name} and its corresponding index file`)
                } else {
                    configurations.push({url: path, name, filename: name, _derivedName: true})
                }

            }

            if (configurations.length > 0) {
                await fileLoadHandler(configurations)
            }

        } catch (e) {
            console.error(e)
            alertSingleton.present(e.message || `${e}`)
        }

    }

    /**
     * Derive a filename from a File object or URL string.
     * @param path
     * @returns {Promise<string>}
     */
    static async getFilename(path) {

        if (path instanceof File) {
            return path.name
        } else if (GoogleUtils.isGoogleDriveURL(path)) {
            const info = await GoogleDrive.getDriveFileInfo(path)
            return info.name || info.originalFileName
        } else {
            const result = URIUtils.parseUri(path)
            return result.file
        }

    }
}

const indexExtensions = new Set(['bai', 'csi', 'tbi', 'idx', 'crai', 'fai'])

const requireIndex = new Set(['bam', 'cram', 'fa', 'fasta'])

const createIndexLUTKey = (name, extension) => {

    let key = name.substring(0, name.length - (extension.length + 1))

    // bam and cram files (.bai, .crai) have 2 conventions:
    // <data>.bam.bai
    // <data>.bai

    if ('bai' === extension && !key.endsWith('bam')) {
        return `${key}.bam`
    } else if ('crai' === extension && !key.endsWith('cram')) {
        return `${key}.cram`
    } else {
        return key
    }

}

export default MultipleTrackLoadHelper