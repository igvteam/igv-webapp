// javascript
import alertSingleton from './alertSingleton.js'
import {FileUtils, GoogleDrive, GoogleUtils, URIUtils} from "../../node_modules/igv-utils/src/index.js"

class MultipleTrackLoadHelper {

    constructor(fileLoadHandler) {
        this.fileLoadHandler = fileLoadHandler
    }

    /**
     * Load one or more track files.
     * @param descriptors - array of objects with 'path' and optional 'name' attributes. Path can be a File object
     * or a URL string.
     *
     * @returns {Promise<void>}
     */
    async loadTrackFiles(descriptors) {

        if (!Array.isArray(descriptors) || descriptors.length === 0) {
            return
        }

        try {
            // Step 1: Resolve all filenames in parallel
            const files = await Promise.all(descriptors.map(({path, name}) => {
                const resolvedName = name
                const extension = (FileUtils.getExtension(resolvedName) || '').toLowerCase()
                return {path, name: resolvedName, extension}
            }))

            // Step 2: Separate index files from data files
            const indexLUT = new Map()
            const dataFiles = []
            for (const file of files) {
                if (indexExtensions.has(file.extension)) {
                    const key = createIndexLUTKey(file.name, file.extension)
                    indexLUT.set(key, file.path)
                } else {
                    dataFiles.push(file)
                }
            }

            // Step 3: Build configurations
            const configurations = dataFiles.map(({path, name, extension}) => {
                const config = {
                    url: path,
                    name: name,
                    filename: name,    // Important for Google Drive files
                    _derivedName: true
                }

                if (indexLUT.has(name)) {
                    config.indexURL = indexLUT.get(name)
                } else if (requireIndex.has(extension)) {
                    throw new Error(`Unable to load track file ${name} - you must select both ${name} and its corresponding index file`)
                }
                return config
            })

            // Step 4: Load configurations
            if (configurations.length > 0) {
                await this.fileLoadHandler(configurations)
            }

        } catch (e) {
            console.error(e)
            alertSingleton.present(e.message || `${e}`)
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