import FileLoad from "./fileLoad.js"

class SessionFileLoad extends FileLoad {

    constructor({localFileInput, initializeDropbox, dropboxButton, googleEnabled, googleDriveButton, loadHandler}) {
        super({localFileInput, initializeDropbox, dropboxButton, googleEnabled, googleDriveButton})
        this.loadHandler = loadHandler
    }

    async loadPaths(paths) {

        const path = paths[0]

        try {
            this.loadHandler({url: path})

        } catch (e) {
            throw new Error('Session file did not load' + e.message)
        }
    };

}

export default SessionFileLoad
