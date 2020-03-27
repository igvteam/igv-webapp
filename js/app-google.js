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

import igv from '../node_modules/igv/dist/igv.esm.js';
import {alertPanel} from "./main.js";

let picker;

function init(clientId) {

    let scope,
        config;

    scope =
        [
            'https://www.googleapis.com/auth/devstorage.read_only',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/drive.readonly'
        ];

    config =
        {
            'clientId': clientId,
            'scope': scope.join(' ')
        };

    return gapi.client.init(config)
}

function postInit() {
    let callback,
        onerror,
        config;

    gapi.auth2
        .getAuthInstance()
        .isSignedIn
        .listen(updateSignInStatus);

    callback = () => {
        console.log('Google Picker library loaded successfully');
    };

    onerror = () => {
        console.log('Error loading Google Picker library');
        alert('Error loading Google Picker library');
    };

    config =
        {
            callback: callback,
            onerror: onerror
        };

    gapi.load('picker', config);

};

function createDropdownButtonPicker(multipleFileSelection, filePickerHandler) {

    getAccessToken()
        .then(function (accessToken) {
            updateSignInStatus(true);
            return accessToken;
        })
        .then(function (accessToken) {

            let view,
                teamView;

            view = new google.picker.DocsView(google.picker.ViewId.DOCS);
            view.setIncludeFolders(true);

            teamView = new google.picker.DocsView(google.picker.ViewId.DOCS);
            teamView.setEnableTeamDrives(true);
            teamView.setIncludeFolders(true);

            if (accessToken) {

                if (multipleFileSelection) {
                    picker = new google.picker.PickerBuilder()
                        .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
                        .setOAuthToken(igv.oauth.google.access_token)
                        .addView(view)
                        .addView(teamView)
                        .enableFeature(google.picker.Feature.SUPPORT_TEAM_DRIVES)
                        .setCallback(function (data) {
                            if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
                                filePickerHandler(data[google.picker.Response.DOCUMENTS]);
                            }
                        })
                        .build();

                } else {
                    picker = new google.picker.PickerBuilder()
                        .disableFeature(google.picker.Feature.MULTISELECT_ENABLED)
                        .setOAuthToken(igv.oauth.google.access_token)
                        .addView(view)
                        .addView(teamView)
                        .enableFeature(google.picker.Feature.SUPPORT_TEAM_DRIVES)
                        .setCallback(function (data) {
                            if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
                                filePickerHandler(data[google.picker.Response.DOCUMENTS]);
                            }
                        })
                        .build();

                }

                picker.setVisible(true);

            } else {
                alertPanel.presentAlert("Sign into Google before using picker");
            }
        })
        .catch(function (error) {
            console.log(error)
        });


};

function signInHandler() {

    let scope,
        options;

    scope =
        [
            'https://www.googleapis.com/auth/devstorage.read_only',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/drive.readonly'
        ];

    options = new gapi.auth2.SigninOptionsBuilder();
    options.setPrompt('select_account');
    options.setScope(scope.join(' '));

    return gapi.auth2
        .getAuthInstance()
        .signIn(options)
        .then(function (user) {

            let authResponse;

            authResponse = user.getAuthResponse();

            igv.setGoogleOauthToken(authResponse["access_token"]);

            return authResponse["access_token"];
        })
};

function getAccessToken() {

    if (igv.oauth.google.access_token) {
        return Promise.resolve(igv.oauth.google.access_token);
    } else {
        return signInHandler();
    }
};

function pickerCallback(data) {

    let doc,
        obj,
        documents;

    documents = data[google.picker.Response.DOCUMENTS];

    doc = documents[0];

    obj =
        {
            name: doc[google.picker.Document.NAME],
            path: 'https://www.googleapis.com/drive/v3/files/' + doc[google.picker.Document.ID] + '?alt=media'
        };

    return obj;
};

function updateSignInStatus(signInStatus) {
    // do nothing
};


export {init, postInit, createDropdownButtonPicker};
