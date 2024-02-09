import AlertSingleton from './alertSingleton.js'
import {FileUtils, URIUtils, GoogleUtils, GoogleDrive, GooglePicker} from "../../node_modules/igv-utils/src/index.js"

class MultipleTrackFileLoad {

    constructor({
                    $localFileInput,
                    initializeDropbox,
                    $dropboxButton,
                    $googleDriveButton,
                    fileLoadHandler,
                    multipleFileSelection
                }) {

        this.fileLoadHandler = fileLoadHandler

        const localFileInput = $localFileInput.get(0)
        const dropboxButton = $dropboxButton ? $dropboxButton.get(0) : undefined
        const googleDriveButton = $googleDriveButton ? $googleDriveButton.get(0) : undefined

        localFileInput.addEventListener('change', async () => {

            if (true === MultipleTrackFileLoad.isValidLocalFileInput(localFileInput)) {
                const {files} = localFileInput
                const paths = Array.from(files)
                localFileInput.value = ''
                await this.loadPaths(paths)
            }

        })

        if (dropboxButton) dropboxButton.addEventListener('click', async () => {

            const result = await initializeDropbox()

            if (true === result) {

                const obj =
                    {
                        success: dbFiles => this.loadPaths(dbFiles.map(({link}) => link)),
                        cancel: () => {
                        },
                        linkType: "preview",
                        multiselect: multipleFileSelection,
                        folderselect: false,
                    }

                Dropbox.choose(obj)

            } else {
                AlertSingleton.present('Cannot connect to Dropbox')
            }
        })


        if (googleDriveButton) {

            googleDriveButton.addEventListener('click', () => {
                GooglePicker.createDropdownButtonPicker(multipleFileSelection,
                    async responses => await this.loadPaths(responses.map(({
                                                                               name,
                                                                               url
                                                                           }) => url)))
            })

        }

    }

    async loadPaths(paths) {
        await ingestPaths({paths, fileLoadHandler: this.fileLoadHandler})
    }

    static isValidLocalFileInput(input) {
        return (input.files && input.files.length > 0)
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

async function ingestPaths({paths, fileLoadHandler}) {
    try {
        // Search for index files  (.bai, .csi, .tbi, .idx)
        const indexLUT = new Map()

        const dataPaths = []
        for (let path of paths) {

            const name = await MultipleTrackFileLoad.getFilename(path)
            const extension = FileUtils.getExtension(name)

            if (indexExtensions.has(extension)) {

                // key is the data file name
                const key = createIndexLUTKey(name, extension)
                indexLUT.set(key, {
                    indexURL: path,
                    indexFilename: MultipleTrackFileLoad.isGoogleDrivePath(path) ? name : undefined
                })
            } else {
                dataPaths.push(path)
            }

        }

        const configurations = []

        for (let dataPath of dataPaths) {

            const filename = await MultipleTrackFileLoad.getFilename(dataPath)

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
        AlertSingleton.present(e.message)
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

export default MultipleTrackFileLoad
