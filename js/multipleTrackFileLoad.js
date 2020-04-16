/*
 *  The MIT License (MIT)
 *
 * Copyright (c) 2016-2017 The Regents of the University of California
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
 * associated documentation files (the "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the
 * following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial
 * portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
 * BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

import { Alert, GoogleFilePicker, Utils } from '../node_modules/igv-widgets/dist/igv-widgets.js';
import { FileUtils, TrackUtils } from "../node_modules/igv-utils/src/index.js"

class MultipleTrackFileLoad {

    constructor ({ $localFileInput, $dropboxButton, $googleDriveButton, fileLoadHandler, multipleFileSelection, igvxhr, google }) {

        $localFileInput.on('change', async () => {

            if (true === MultipleTrackFileLoad.isValidLocalFileInput($localFileInput)) {

                const input = $localFileInput.get(0);
                const { files } = input;
                const paths = Array.from(files);

                input.value = '';

                await ingestPaths( { paths, fileLoadHandler, google, igvxhr } );
            }

        });

        $dropboxButton.on('click', () => {

            const obj =
                {
                    success: dbFiles => ingestPaths( { paths: dbFiles.map(({ link }) => link), fileLoadHandler, google, igvxhr } ),
                    cancel: () => {},
                    linkType: "preview",
                    multiselect: multipleFileSelection,
                    folderselect: false,
                };

            Dropbox.choose( obj );
        });

        if ($googleDriveButton) {

            $googleDriveButton.on('click', () => {

                GoogleFilePicker.createDropdownButtonPicker(multipleFileSelection, async responses => {

                    const obj = responses.map(({ name, url }) => {

                        return {
                            url: google.driveDownloadURL(url),

                            // TODO: NOT NEEDED! Used only for compatibility with FileUtils.getExtension()
                            google_url: google.driveDownloadURL(url),

                            name,
                            filename: name,
                            format: TrackUtils.inferFileFormat(name)
                        };

                    });

                    await ingestPaths({ paths: obj, fileLoadHandler, google, igvxhr });
                });

            });

        }

    }

    static isValidLocalFileInput($input) {
        return ($input.get(0).files && $input.get(0).files.length > 0);
    }

}

const ingestPaths = async ({ paths, fileLoadHandler, google, igvxhr }) => {

    const { jsonConfigurations, remainingPaths } = await getJSONTrackConfigurations(paths, google, igvxhr);

    if (remainingPaths) {

        const LUT = {};
        for (let path of remainingPaths) {
            const name = getFilenameComprehensive(path);
            LUT[ name ] = path;
        }

        // LUT for data file paths
        const dataFileLUT = createDataFilePathLUT(LUT, google);

        if (Object.keys(dataFileLUT).length > 0) {

            // LUT for track configurations
            const trackConfigurationLUT = createTrackConfigurationLUT(dataFileLUT, google);

            // add index file associations to track files
            assessIndexFileAssociations(LUT, trackConfigurationLUT);

            // error assessment
            let { configurations, errorStrings } = validateTrackConfigurations(trackConfigurationLUT);

            if (configurations) {
                fileLoadHandler( jsonConfigurations ? jsonConfigurations.concat(configurations) : configurations )
            }

            if (errorStrings) {
                // console.log(errorStrings.join('\n'));
                Alert.presentAlert(errorStrings.join('\n'))
            }

        }

    } else {
        fileLoadHandler( jsonConfigurations );
    }

};

const getJSONTrackConfigurations = async (paths, google, igvxhr) => {

    let remainingPaths = [];
    let jsonPaths = [];
    for (let path of paths) {

        const extension = FileUtils.getExtension(path);

        if ('json' === extension) {
            jsonPaths.push(path);
        } else {
            remainingPaths.push(path)
        }
    }

    if (0 === jsonPaths.length) {
        return { jsonConfigurations: undefined, remainingPaths };
    }

    const promises = jsonPaths.map(path => path.url ? handleGoogleJSON( path.url, igvxhr ) : igvxhr.loadJson( path ));

    if (0 === remainingPaths.length) {
        remainingPaths = undefined;
    }

    return { jsonConfigurations: await Promise.all(promises), remainingPaths }

};

const handleGoogleJSON = async (url, igvxhr) => {
    const result = await igvxhr.load( url );
    return JSON.parse(result);
};

const createDataFilePathLUT = (LUT, google) => {

    const result = {};

    for (let [ key, path ] of Object.entries(LUT)) {

        if (!Utils.isValidIndexExtension(key)) {

            let format = undefined;

            if (path instanceof File) {

                const { name } = path;
                format = TrackUtils.inferFileFormat( name );

            } else if ('object' === typeof path) {

                const { name, url } = path;
                if (google.isGoogleURL(url)) {
                    format = TrackUtils.inferFileFormat( name );
                }

            } else {
                format = TrackUtils.inferFileFormat( getFilenameComprehensive(path) );
            }

            if (undefined !== format) {
                result[ key ] = path;
            } else {
                result[ key ] = { errorString: `Error: Unrecognizedfile format ${ key }`}
            }

        }
        
    }

    return result;
};

const createTrackConfigurationLUT = (dataFileLUT, google) => {

    const result = {};

    for (let [ key, path ] of Object.entries(dataFileLUT)) {

        let config = undefined;

        if (path.errorString) {

            config = { errorString: path.errorString }

        } else if (path instanceof File) {

            const { name } = path;

            config =
                {
                    url: path,
                    name,
                    filename: name
                };

            TrackUtils.inferTrackTypes(config);

        } else if ('object' === typeof path) {

            const { url } = path;

            if (google.isGoogleURL(url)) {
                config = path;
            }

        } else {

            const name = getFilenameComprehensive(path);

            config =
                {
                    url: path,
                    name,
                    filename: name
                };

            TrackUtils.inferTrackTypes(config);

        }

        result[ key ] = config;
    }

    return result;
};

const assessIndexFileAssociations = (LUT, trackConfigurationLUT) => {

    // identify data file - index file associations
    for (let [ key, configuration ] of Object.entries(trackConfigurationLUT)) {

        if (undefined === configuration.errorString) {

            const { index: indexExtension, isOptional } = Utils.knownDataFileIndexFileLookup( FileUtils.getExtension(configuration.name) );
            const indexKey = `${ key }.${ indexExtension }`;

            if (LUT[ indexKey ]) {
                // console.log(`data file ${ key } has ${ isOptional ? 'optional' : 'required' } index file ${ indexKey }`);
                configuration.indexURL = LUT[ indexKey ];
            } else if (false === isOptional) {
                configuration.errorString = `ERROR: data file ${ key } is missing required index file ${ indexKey }`;
            } else {
                // console.log(`data file ${ key } does not require index file ${ indexKey }`);
            }

        }


    }

};

const validateTrackConfigurations = trackConfigurationLUT => {

    let configurations = Object.values(trackConfigurationLUT).filter(({ errorString }) => undefined === errorString);
    if (0 === configurations.length) {
        configurations = undefined;
    }

    let errorStrings = Object.values(trackConfigurationLUT).filter(({ errorString}) => undefined !== errorString).map(({ errorString }) => errorString);
    if (0 === errorStrings.length) {
        errorStrings = undefined;
    }

    return { configurations, errorStrings }
};

const getFilenameComprehensive = path => {

    if (path instanceof File || 'object' === typeof path) {
        const { name } = path;
        return name;
    } else {
        return FileUtils.getFilename(path);
    }

};

export default MultipleTrackFileLoad;
