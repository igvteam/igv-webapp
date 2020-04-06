import FileLoad from "./fileLoad.js";
import {FileUtils} from "../node_modules/igv-utils/src/index.js"
import {getExtension} from "./utils";
import igv from "igv";

class SessionFileLoad extends FileLoad {

    constructor({ localFileInput, dropboxButton, googleEnabled, googleDriveButton, loadHandler, igvxhr, google }) {
        super({ localFileInput, dropboxButton, googleEnabled, googleDriveButton, igvxhr, google });
        this.loadHandler = loadHandler;
    }

    async loadPaths(paths) {

        let list = await this.processPaths(paths);

        const path = list[ 0 ];
        if ('json' === FileUtils.getExtension(path)) {
            const json = await this.igvxhr.loadJson(path);
            this.loadHandler(json);
        } else if ('xml' === FileUtils.getExtension(path)) {

            const key = true === FileUtils.isFilePath(path) ? 'file' : 'url';
            const o = {};
            o[ key ] = path;

            this.loadHandler(o);
        }

    };

}

const getJSONTrackConfigurations = async paths => {

    let remainingPaths = [];
    let jsonPaths = [];
    for (let path of paths) {
        const extension = path.url ? getExtension(path.name) : getExtension(path);
        if ('json' === getExtension(extension)) {
            jsonPaths.push(path);
        } else {
            remainingPaths.push(path)
        }
    }

    if (0 === jsonPaths.length) {
        return { jsonConfigurations: undefined, remainingPaths };
    }

    const promises = jsonPaths.map(path => path.url ? handleGoogleJSON( path.url ) : igv.xhr.loadJson( path ));

    if (0 === remainingPaths.length) {
        remainingPaths = undefined;
    }

    return { jsonConfigurations: await Promise.all(promises), remainingPaths }

};

export default SessionFileLoad;
