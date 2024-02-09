import {FileUtils} from "../../node_modules/igv-utils/src/index.js"

class FileLoadManager {

    constructor() {
        this.dictionary = {}
    }

    inputHandler(path, isIndexFile) {
        this.ingestPath(path, isIndexFile)
    }

    ingestPath(path, isIndexFile) {
        let key = true === isIndexFile ? 'index' : 'data'

        this.dictionary[key] = path.trim()
    }

    didDragDrop(dataTransfer) {
        var files

        files = dataTransfer.files

        return (files && files.length > 0)
    }

    dragDropHandler(dataTransfer, isIndexFile) {
        var url,
            files,
            isValid

        url = dataTransfer.getData('text/uri-list')
        files = dataTransfer.files

        if (files && files.length > 0) {
            this.ingestPath(files[0], isIndexFile)
        } else if (url && '' !== url) {
            this.ingestPath(url, isIndexFile)
        }

    }

    indexName() {
        return itemName(this.dictionary.index)
    }

    dataName() {
        return itemName(this.dictionary.data)
    }

    reset() {
        this.dictionary = {}
    }

}

function itemName(item) {
    return FileUtils.isFilePath(item) ? item.name : item
}

export default FileLoadManager

