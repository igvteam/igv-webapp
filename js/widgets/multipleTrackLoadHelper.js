import alertSingleton from './alertSingleton.js'
import {FileUtils, URIUtils, GoogleUtils, GoogleDrive, GooglePicker} from "../../node_modules/igv-utils/src/index.js"

class MultipleTrackLoadHelper {

    constructor(fileLoadHandler) {

        this.fileLoadHandler = fileLoadHandler

    }


    async loadPaths(paths) {

        const fileLoadHandler = this.fileLoadHandler

        try {
            // Search for index files  (.bai, .csi, .tbi, .idx)
            const indexLUT = new Map()

            const dataPaths = []
            for (let path of paths) {

                const name = await MultipleTrackLoadHelper.getFilename(path)
                const extension = FileUtils.getExtension(name)

                if (indexExtensions.has(extension)) {

                    // key is the data file name
                    const key = createIndexLUTKey(name, extension)
                    indexLUT.set(key, {
                        indexURL: path,
                        indexFilename: MultipleTrackLoadHelper.isGoogleDrivePath(path) ? name : undefined
                    })
                } else {
                    dataPaths.push(path)
                }

            }

            const configurations = []

            for (let dataPath of dataPaths) {

                const filename = await MultipleTrackLoadHelper.getFilename(dataPath)

                if (indexLUT.has(filename)) {

                    const {indexURL, indexFilename} = indexLUT.get(filename)
                    configurations.push({
                        url: dataPath,
                        filename,
                        indexURL,
                        indexFilename,
                        name: filename,
                        _derivedName: true
                    })

                } else if (requireIndex.has(FileUtils.getExtension(filename))) {
                    throw new Error(`Unable to load track file ${filename} - you must select both ${filename} and its corresponding index file`)
                } else {
                    configurations.push({url: dataPath, filename, name: filename, _derivedName: true})
                }

            }

            if (configurations) {
                fileLoadHandler(configurations)
            }

        } catch (e) {
            console.error(e)
            alertSingleton.present(e.message)
        }

    }

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

    static isGoogleDrivePath(path) {
        return path instanceof File ? false : GoogleUtils.isGoogleDriveURL(path)
    }

}


const indexExtensions = new Set(['bai', 'csi', 'tbi', 'idx', 'crai', 'fai'])

const requireIndex = new Set(['bam', 'cram', 'fa', 'fasta'])

const createIndexLUTKey = (name, extension) => {

    let key = name.substring(0, name.length - (extension.length + 1))

    // bam and cram files (.bai, .crai) have 2 conventions:
    // <data>.bam.bai
    // <data>.bai - we will support this one

    if ('bai' === extension && !key.endsWith('bam')) {
        return `${key}.bam`
    } else if ('crai' === extension && !key.endsWith('cram')) {
        return `${key}.cram`
    } else {
        return key
    }

}

export default MultipleTrackLoadHelper
