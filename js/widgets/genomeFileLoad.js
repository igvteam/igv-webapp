import {FileUtils, igvxhr, StringUtils} from "../../node_modules/igv-utils/src/index.js"
import FileLoad from "./fileLoad.js"
import MultipleTrackFileLoad from "./multipleTrackFileLoad.js"

class GenomeFileLoad extends FileLoad {

    constructor({localFileInput, initializeDropbox, dropboxButton, googleEnabled, googleDriveButton, loadHandler}) {
        super({localFileInput, initializeDropbox, dropboxButton, googleEnabled, googleDriveButton})
        this.loadHandler = loadHandler
    }

    /**
     * Load a reference genome, which can be  is a JSON, hub.txt, .gbk, .2bit, or a fasta file with an index.  The
     * function takes an array of paths, which be either url or file paths.  With the exception of the fasta file
     * the paths array should only contain one element.  The fasta file can be a single file, or a pair of files.
     *
     * @param paths
     * @returns {Promise<void>}
     */
    async loadPaths(paths) {

        let configuration = undefined

        if(paths.length == 0) {
            return
        }

        const filenames = []
        for(let p of paths) {
            const filename = await MultipleTrackFileLoad.getFilename(p)
            filenames.push(filename)
        }

        paths.map(async path => await MultipleTrackFileLoad.getFilename(path))

        const path1 = paths[0]
        if(1 === paths.length) {
            const extension = FileUtils.getExtension(path1)
            if ('json' === extension) {
                configuration = await igvxhr.loadJson(path1)
            } else if (filenames[0].endsWith("hub.txt") ) {
                configuration = {url: path1}
            } else if ('gbk' === extension) {
                configuration = {gbkURL: path1}
            }
            //else if ('2bit' === extension) {
            //    configuration = {twoBitURL: paths[0]}
            //}
            else {
                // Assume this is a fasta file.  There is no standard extension, and no way to really know for sure.
                // If we can determine the file size and it is not too large relax requirement for an index file
                let fileSize = await igvxhr.getContentLength(path1)
                if (fileSize > 0 && fileSize < 10000000) {
                    configuration = {fastaURL: path1}
                }
            }
        } else {   // 2 paths entered, assume they are a fasta and index file
            const path2 = paths[1];

            if (await this.isGzipped(filenames[0]) || await this.isGzipped(filenames[1])) {
                throw new Error('Genome did not load - Gzipped fasta files with indexes are not supported')
            }
            const [ext1, ext2] = filenames.map(file => FileUtils.getExtension(file))
            if ('fai' === ext1) {
                configuration = {fastaURL: path2, indexURL: path1}
            } else if ('fai' === ext2) {
                configuration = {fastaURL: path1, indexURL: path2}
            } else {
                throw new Error('Genome did not load - did not detect index file (expected extension .fai)')
            }
        }

        if (undefined === configuration) {
            throw new Error('Genome requires either a single JSON, UCSC hub.txt, genbank ".gbk", or a FASTA & index file')
        } else {
            this.loadHandler(configuration)
        }
    }

    async isGzipped(name) {
        return name.endsWith(".gz")
    }

}


export default GenomeFileLoad
