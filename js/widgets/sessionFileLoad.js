import FileLoad from "./fileLoad.js"

/**
 *  Extends the FileLoad class to handle the loading of session files (JSON).
 */
class SessionFileLoad extends FileLoad {

    constructor({localFileInput, dropboxButton, googleEnabled, googleDriveButton, loadHandler}) {
        super({localFileInput, dropboxButton, googleEnabled, googleDriveButton})
        this.loadHandler = loadHandler
    }

    /**
     * Load a session file (JSON).
     * `descriptors`: array of size 1 { path: File|string, name?: string }.
     *
     * @param descriptors
     * @returns {Promise<void>}
     */
    async loadFiles(descriptors) {
        try {
            if (!Array.isArray(descriptors) || descriptors.length === 0 || !descriptors[0]?.path) {
                throw new Error('Invalid or missing session file descriptor')
            }

            const {path, name} = descriptors[0]
            const filename = name

            await this.loadHandler({url: path, filename})
        } catch (e) {
            throw new Error(`Session file did not load: ${e.message || e}`)
        }
    }
}

export default SessionFileLoad
