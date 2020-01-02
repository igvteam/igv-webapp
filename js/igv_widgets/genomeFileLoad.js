import FileLoad from "./fileLoad.js";
import { Alert, FileUtils, igvxhr } from '../../node_modules/igv-widgets/dist/igv-widgets.js';

const referenceSet = new Set(['fai', 'fa', 'fasta']);
const dataSet = new Set(['fa', 'fasta']);
const indexSet = new Set(['fai']);

const errorString = 'ERROR: Load either: 1) single XML file 2). single JSON file. 3) data file (.fa or .fasta ) & index file (.fai).';
class GenomeFileLoad extends FileLoad {

    constructor({ localFileInput, dropboxButton, googleEnabled, googleDriveButton, loadHandler }) {
        super({ localFileInput, dropboxButton, googleEnabled, googleDriveButton });
        this.loadHandler = loadHandler;
    }

    async loadPaths(paths) {

        let list = await this.processPaths(paths);

        if (1 === list.length) {

            const path = list[ 0 ];
            if ('json' === FileUtils.getExtension(path)) {
                const json = await igvxhr.loadJson((path.google_url || path));
                this.loadHandler(json);
            } else if ('xml' === FileUtils.getExtension(path)) {

                const key = true === FileUtils.isFilePath(path) ? 'file' : 'url';
                const o = {};
                o[ key ] = path;

                this.loadHandler(o);
            } else {
                Alert.presentAlert(`${ errorString }`);
            }

        } else if (2 === list.length) {

            let [ a, b ] = list.map(path => {
                return FileUtils.getExtension(path)
            });

            if (false === GenomeFileLoad.extensionValidator(a, b)) {
                Alert.presentAlert(`${ errorString }`);
                return;
            }

            const [ dataPath, indexPath ] = GenomeFileLoad.retrieveDataPathAndIndexPath(list);

            await this.loadHandler({ fastaURL: dataPath, indexURL: indexPath });

        } else {
            Alert.presentAlert(`${ errorString }`);
        }

    };

    static retrieveDataPathAndIndexPath(list) {

        let [ a, b ] = list.map(path => {
            return FileUtils.getExtension(path)
        });

        if (dataSet.has(a) && indexSet.has(b)) {
            return [ list[ 0 ], list[ 1 ] ];
        } else {
            return [ list[ 1 ], list[ 0 ] ];
        }

    };

    static extensionValidator(a, b) {
        if (dataSet.has(a) && indexSet.has(b)) {
            return true;
        } else {
            return dataSet.has(b) && indexSet.has(a);
        }
    }

    static pathValidator(extension) {
        return referenceSet.has(extension);
    }

    static configurationHandler(dataKey, dataValue, indexPaths) {
        return { fastaURL: dataValue, indexURL: FileLoad.getIndexURL(indexPaths[ dataKey ]) };
    }

}

export default GenomeFileLoad;
