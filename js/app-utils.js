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
var app = (function (app) {

    let picker;

    app.utils =
        {

            isJSON: function (thang) {
                // Better JSON test. JSON.parse gives false positives.
                return (true === (thang instanceof Object) && false === (thang instanceof File));
            },

            configureModal: function (fileLoadWidget, $modal, okHandler = undefined) {
                let $dismiss,
                    $ok;

                // upper dismiss - x - button
                $dismiss = $modal.find('.modal-header button:nth-child(1)');
                $dismiss.on('click', function () {
                    fileLoadWidget.dismiss();
                });

                // lower dismiss - close - button
                $dismiss = $modal.find('.modal-footer button:nth-child(1)');
                $dismiss.on('click', function () {
                    fileLoadWidget.dismiss();
                });

                // ok - button
                $ok = $modal.find('.modal-footer button:nth-child(2)');

                $ok.on('click', function () {

                    if (okHandler) {
                        okHandler(fileLoadWidget.fileLoadManager);
                    } else {
                        fileLoadWidget.fileLoadManager.okHandler();
                        fileLoadWidget.dismiss();
                        $modal.modal('hide');
                    }

                });

            },

            loadGenome: function (genome) {

                igv.browser
                    .loadGenome(genome)
                    .then(function (genome) {

                        if (genome.id && app.ModalTable.getAssembly(genome.id)) {
                            app.trackLoadController.createEncodeTable(genome.id);
                            app.trackLoadController.updateAnnotationsSelectList(genome.id);
                        } else {
                            app.trackLoadController.encodeTable.hidePresentationButton();
                        }

                    })
                    .catch(function (error) {
                        igv.presentAlert(error);
                    });

            }
        };

    app.Google =
        {
            init: function ($googleAccountSwitchButtons) {

                this.$googleAccountSwitchButtons = $googleAccountSwitchButtons;

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

                    });
            },

            signInHandler: function () {

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
            },

            getAccessToken: function () {

                if (igv.oauth.google.access_token) {
                    return Promise.resolve(igv.oauth.google.access_token);
                } else {
                    return app.Google.signInHandler();
                }
            },

            switchUser: function () {
                app.Google.signInHandler()
                    .then(function (accessToken) {
                        app.Google.updateSignInStatus(true);
                    });
            },

            postInit: function () {
                let callback,
                    onerror,
                    config;

                gapi.auth2
                    .getAuthInstance()
                    .isSignedIn
                    .listen(app.Google.updateSignInStatus);

                callback = function () {
                    console.log('Google Picker library loaded successfully');
                };

                onerror = function () {
                    console.log('Error loading Google Picker library');
                    alert('Error loading Google Picker library');
                };

                config =
                    {
                        callback: callback,
                        onerror: onerror
                    };

                gapi.load('picker', config);

            },

            createPicker: function (fileLoadManager, $modal, $filenameContainer, isIndexFile, filePickerHandler) {

                app.Google.getAccessToken()
                    .then(function (accessToken) {
                        app.Google.updateSignInStatus(true);
                        return Promise.resolve(accessToken);
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

                            picker = new google.picker
                                .PickerBuilder()
                                .setAppId(igv.Google.properties["project_number"])
                                .setOAuthToken(igv.oauth.google.access_token)
                                .addView(view)
                                .addView(teamView)
                                .enableFeature(google.picker.Feature.SUPPORT_TEAM_DRIVES)
                                .setDeveloperKey(igv.Google.properties["developer_key"])
                                .setCallback(function (data) {
                                    if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
                                        let response;

                                        response = app.Google.pickerCallback(data);

                                        filePickerHandler(fileLoadManager, $modal, response, $filenameContainer, isIndexFile);

                                    }
                                })
                                .build();

                            picker.setVisible(true);
                        } else {
                            igv.presentAlert("Sign into Google before using picker");
                        }
                    })
                    .catch(function (error) {
                        console.log(error)
                    });



            },

            pickerCallback: function (data) {

                let doc,
                    obj;

                doc = data[google.picker.Response.DOCUMENTS][0];

                obj =
                    {
                        name: doc[ google.picker.Document.NAME ],
                        path: 'https://www.googleapis.com/drive/v3/files/' + doc[ google.picker.Document.ID ] + '?alt=media'
                    };

                return obj;
            },

            updateSignInStatus: function (signInStatus) {

                if (signInStatus) {
                    let username,
                        $e;

                    username = gapi.auth2
                        .getAuthInstance()
                        .currentUser
                        .get()
                        .getBasicProfile()
                        .getName();

                    // $e = $("#igv-app-google-account-switch-button");
                    // $e.text("Logged in as: " + username);
                    // $e.show();

                    this.$googleAccountSwitchButtons.find('span').text(username);
                    this.$googleAccountSwitchButtons.show();
                }

            }

        };

    return app;
})(app || {});