import FileLoad from "./fileLoad.js";
import {FileUtils} from "../node_modules/igv-utils/src/index.js"

class SessionFileLoad extends FileLoad {

    constructor({ localFileInput, dropboxButton, googleEnabled, googleDriveButton, loadHandler, igvxhr, google }) {
        super({ localFileInput, dropboxButton, googleEnabled, googleDriveButton, igvxhr, google });
        this.loadHandler = loadHandler;
    }

    async loadPaths(paths) {

        let list = await this.processPaths(paths);

        const path = list[ 0 ];
        if ('json' === FileUtils.getExtension(path)) {
            const json = await this.igvxhr.loadJson((path.google_url || path));
            this.loadHandler(json);
        } else if ('xml' === FileUtils.getExtension(path)) {

            const key = true === FileUtils.isFilePath(path) ? 'file' : 'url';
            const o = {};
            o[ key ] = path;

            this.loadHandler(o);
        }

    };

}

export default SessionFileLoad;
