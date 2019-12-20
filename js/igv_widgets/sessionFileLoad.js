import FileLoad from "./fileLoad.js";
import { FileUtils, Alert, igvxhr } from '../../node_modules/igv-widgets/dist/igv-widgets.js';

class SessionFileLoad extends FileLoad {

    constructor({ localFileInput, dropboxButton, googleEnabled, googleDriveButton, sessionLoader }) {
        super({ localFileInput, dropboxButton, googleEnabled, googleDriveButton });
        this.sessionLoader = sessionLoader;
    }

    async loadPaths(paths) {

        let list = await this.processPaths(paths);

        const path = list[ 0 ];
        if ('json' === FileUtils.getExtension(path)) {
            const json = await igvxhr.loadJson((path.google_url || path));
            this.sessionLoader(json);
        } else if ('xml' === FileUtils.getExtension(path)) {

            const key = true === FileUtils.isFilePath(path) ? 'file' : 'url';
            const o = {};
            o[ key ] = path;

            this.sessionLoader(o);
        }

    };

}

export default SessionFileLoad;
