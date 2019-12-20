import { FileUtils, GoogleUtils, GoogleFilePicker } from '../../node_modules/igv-widgets/dist/igv-widgets.js';
import { DomUtils } from '../../node_modules/igv-ui/dist/igv-ui.js';
class FileLoad {
    constructor({ localFileInput, dropboxButton, googleEnabled, googleDriveButton }) {

        localFileInput.addEventListener('change', async () => {

            if (true === FileLoad.isValidLocalFileInput(localFileInput)) {
                await this.loadPaths( Array.from(localFileInput.files) );
                localFileInput.value = '';
            }

        });

        dropboxButton.addEventListener('click', () => {

            const config =
                {
                    success: dbFiles => this.loadPaths( dbFiles.map(dbFile => dbFile.link) ),
                    cancel: () => {},
                    linkType: 'preview',
                    multiselect: true,
                    folderselect: false,
                };

            Dropbox.choose( config );

        });


        if (false === googleEnabled) {
            DomUtils.hide(googleDriveButton.parentElement);
        }

        if (true === googleEnabled && googleDriveButton) {

            googleDriveButton.addEventListener('click', () => {

                GoogleFilePicker.createDropdownButtonPicker(true, responses => {

                    const paths = responses
                        .map(({ name, url: google_url }) => {
                            return { filename: name, name, google_url };
                        });

                    this.loadPaths(paths);
                });

            });

        }

    }

    async loadPaths(paths) {
        console.log('FileLoad: loadPaths(...)');
    }

    async processPaths(paths) {

        let tmp = [];
        let googleDrivePaths = [];
        for (let path of paths) {

            if (FileUtils.isFilePath(path)) {
                tmp.push(path);
            } else if (undefined === path.google_url && path.includes('drive.google.com')) {
                const fileInfo = await GoogleUtils.getDriveFileInfo(path);
                googleDrivePaths.push({ filename: fileInfo.name, name: fileInfo.name, google_url: path});
            } else {
                tmp.push(path);
            }
        }

        return tmp.concat(googleDrivePaths);

    }

    static isValidLocalFileInput(input) {
        return (input.files && input.files.length > 0);
    }

}

export default FileLoad;
