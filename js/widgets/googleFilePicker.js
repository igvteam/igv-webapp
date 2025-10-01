/*
 *  Author: Jim Robinson, 2020
 *
 * Wrapper functions for the Google picker API
 *
 * PREQUISITES
 *    gapi loaded
 *    oauth2 loaded and initialized
 *
 * This wrapper is stateless -- this is important as multiple copies of igv-utils might be present
 * in an application.  All state is held in the gapi library itself.
 */

import * as GoogleAuth from '../../node_modules/igv-utils/src/google-utils/googleAuth.js'

async function init() {
    return new Promise(function (resolve, reject) {
        gapi.load("picker", {
            callback: resolve,
            onerror: reject
        })
    })
}

async function createDropdownButtonPicker(multipleFileSelection, filePickerHandler) {


    if (typeof gapi === "undefined") {
        throw Error("Google authentication requires the 'gapi' library")
    }

    if (typeof google === "undefined" || !google.picker) {
        await init()
    }

    const access_token = await GoogleAuth.getAccessToken('https://www.googleapis.com/auth/drive.file')
    if (access_token) {

        const view = new google.picker.DocsView(google.picker.ViewId.DOCS)
        view.setIncludeFolders(true)

        const teamView = new google.picker.DocsView(google.picker.ViewId.DOCS)
        teamView.setEnableTeamDrives(true)
        teamView.setIncludeFolders(true)

        let picker
        if (multipleFileSelection) {
            picker = new google.picker.PickerBuilder()
                .setAppId(google.igv.appId)
                .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
                .setOAuthToken(access_token)
                .addView(view)
                .addView(teamView)
                .enableFeature(google.picker.Feature.SUPPORT_TEAM_DRIVES)
                .setCallback(function (data) {
                    if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
                        filePickerHandler(data[google.picker.Response.DOCUMENTS])
                    }
                })
                .build()

        } else {
            picker = new google.picker.PickerBuilder()
                .setAppId(google.igv.appId)
                .disableFeature(google.picker.Feature.MULTISELECT_ENABLED)
                .setOAuthToken(access_token)
                .addView(view)
                .addView(teamView)
                .enableFeature(google.picker.Feature.SUPPORT_TEAM_DRIVES)
                .setCallback(function (data) {
                    if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
                        filePickerHandler(data[google.picker.Response.DOCUMENTS])
                    }
                })
                .build()

        }

        picker.setVisible(true)

    } else {
        throw Error("Sign into Google before using picker")
    }
}


export {init, createDropdownButtonPicker}
