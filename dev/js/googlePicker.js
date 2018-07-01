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

function appGoogleInit($container, igvConfig) {

    return igv.Google
        .loadGoogleProperties("https://s3.amazonaws.com/igv.org.app/web_client_google")
        .then(function (properties) {
            let scope,
                config;

            scope =
                [
                    'https://www.googleapis.com/auth/cloud-platform',
                    'https://www.googleapis.com/auth/genomics',
                    'https://www.googleapis.com/auth/devstorage.read_only',
                    'https://www.googleapis.com/auth/userinfo.profile',
                    'https://www.googleapis.com/auth/drive.readonly'
                ];

            config =
                {
                    'clientId': properties["client_id"],
                    'scope': scope.join(' ')
                };

            return gapi.client.init(config)

        })
        .then(function () {

            igvConfig['apiKey'] = igv.Google.properties['api_key'];
            return igv.createBrowser($container.get(0), igvConfig);

        });

}

function appGoogleInitCleanup() {

    gapi.auth2
        .getAuthInstance()
        .isSignedIn
        .listen(updateSigninStatus);

    gapi.load('picker', function () {

        // enable button
        $('#googlePickerButton').prop('disabled', false);

    });

    function updateSigninStatus(isSignedIn) {

        if (isSignedIn) {
            let user,
                profile,
                username;

            user = gapi.auth2.getAuthInstance().currentUser.get();
            profile = user.getBasicProfile();
            username = profile.getName();

            // $("#igv-app-google-account-switch-button").html("Logged in as: " + username);

        }

    }

}

function appGooglePicker() {

    getAccessToken()
        .then(function (accessToken) {

            if (accessToken) {

                picker = new google.picker
                    .PickerBuilder()
                    .setAppId(igv.Google.properties["project_number"])
                    .setOAuthToken(igv.oauth.google.access_token)
                    .addView( new google.picker.View(google.picker.ViewId.DOCS) )
                    .setDeveloperKey(igv.Google.properties["developer_key"])
                    .setCallback(pickerCallback)
                    .build();

                picker.setVisible(true);
            }
            else {
                igv.presentAlert("Sign into Google before using picker");
            }
        })
        .catch(function (error) {
            console.log(error)
        });

    function getAccessToken() {

        if (igv.oauth.google.access_token) {
            return Promise.resolve(igv.oauth.google.access_token);
        } else {
            return signIn();
        }
    }

    function signIn() {

        var scope,
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

        return gapi.auth2.getAuthInstance().signIn(options)

            .then(function (user) {

                let authResponse = user.getAuthResponse();

                igv.setGoogleOauthToken(authResponse["access_token"]);

                return authResponse["access_token"];
            })
    }

    function pickerCallback(data) {

        if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
            let doc,
                url,
                name,
                id,
                format;

            doc = data[google.picker.Response.DOCUMENTS][0];

            url = doc[google.picker.Document.URL];

            name = doc[google.picker.Document.NAME];

            id = doc[google.picker.Document.ID];

            format = igv.inferFileFormat(name);

            if (!format) {
                alert("Unrecognized file format: " + name);
            } else {
                let config;

                config =
                    {
                        url: "https://www.googleapis.com/drive/v3/files/" + id + "?alt=media",
                        filename: name,
                        name: name,
                        format: format
                    };

                igv.browser.loadTrack(config);

            }
        }

    }
}
