import alertSingleton from './alertSingleton.js'
import {GooglePicker} from "../../node_modules/igv-utils/src/index.js"
import {initializeDropbox} from "./dropbox.js"

/**
 * FileLoad is a base class that handles loading files from local file input, Dropbox, and Google Drive.  Used
 * by SessionFileLoad and GenomeFileLoad.
 */

class FileLoad {

    constructor({localFileInput, dropboxButton, googleDriveButton}) {

        localFileInput.addEventListener('change', async () => {

            if (true === FileLoad.isValidLocalFileInput(localFileInput)) {

                try {
                    await this.loadFiles(Array.from(localFileInput.files).map(file => ({path: file, name: file.name})))
                } catch (e) {
                    console.error(e)
                    alertSingleton.present(e)
                }
                localFileInput.value = ''
            }

        })

        if (dropboxButton) {
            dropboxButton.addEventListener('click', async () => {

                const result = await initializeDropbox()

                if (true === result) {

                    const config =
                        {
                            success: dbFiles => {
                                return trackLoadHelper.loadTrackFiles(dbFiles.map(({link, name}) => ({
                                    path: link,
                                    name: name
                                })))
                            },
                            cancel: () => {
                            },
                            linkType: 'direct',
                            multiselect: true,
                            folderselect: false,
                        }

                    Dropbox.choose(config)

                } else {
                    alertSingleton.present('Cannot connect to Dropbox')
                }

            })
        }

        if (googleDriveButton) {
            googleDriveButton.addEventListener('click', () => {
                GooglePicker.createDropdownButtonPicker(true, async responses => {
                    try {
                        await this.loadFiles(responses.map(({id, name}) => ({path: `https://www.googleapis.com/drive/v3/files/${id}?alt=media&supportsTeamDrives=true`, name})))
                    } catch (e) {
                        console.error(e)
                        alertSingleton.present(e)
                    }
                })
            })

        }

    }

    async loadFiles(paths) {
        //console.log('FileLoad: loadPaths(...)');
    }

    static isValidLocalFileInput(input) {
        return (input.files && input.files.length > 0)
    }

}

export default FileLoad
