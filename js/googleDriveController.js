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

    app.GoogleDriveController = function (browser, $modal) {
        this.browser = browser;
        this.$modal = $modal;
    };

    app.GoogleDriveController.prototype.configure = function (pickerCallback) {

        let self = this,
            loaderConfig,
            $dismiss,
            $ok;

        loaderConfig =
            {
                hidden: false,
                embed: true,
                $widgetParent: this.$modal.find('.modal-body'),
                mode: 'localFile'
            };

        this.loader = this.browser.createFileLoadWidget(loaderConfig, new igv.FileLoadManager());

        this.loader.customizeLayout(function ($parent) {
            let $file_chooser_container;

            $file_chooser_container = $parent.find('.igv-flw-file-chooser-container');
            $file_chooser_container.each(function (index) {
                let $div,
                    $filenameContainer;

                $(this).empty();
                $div = $('<div>', { class: 'igv-app-google-drive-button-container' });
                $(this).append($div);
                $div.text('Google Drive');

                $filenameContainer = $(this).parent().find('.igv-flw-local-file-name-container');

                $(this).on('click', function (e) {
                    self.$modal.modal('hide');
                    app.Google.createPicker($filenameContainer, index, pickerCallback);
                });
            });

            $parent.find('.igv-flw-drag-drop-target').remove();

        });

        // upper dismiss - x - button
        $dismiss = this.$modal.find('.modal-header button:nth-child(1)');
        $dismiss.on('click', function () {
            self.loader.dismiss();
        });

        // lower dismiss - close - button
        $dismiss = this.$modal.find('.modal-footer button:nth-child(1)');
        $dismiss.on('click', function () {
            self.loader.dismiss();
        });

        // ok - button
        $ok = this.$modal.find('.modal-footer button:nth-child(2)');
        $ok.on('click', function () {
            self.okHandler();
            self.loader.dismiss();
            self.$modal.modal('hide');
        });

    };

    app.GoogleDriveController.prototype.okHandler = function () {

        let obj;

        obj = this.trackLoadConfiguration(this.loader.fileLoadManager);
        if (obj) {
            igv.browser.loadTrackList( [ obj ] );
        }

    };

    app.GoogleDriveController.prototype.trackLoadConfiguration = function (fileLoadManager) {
        let config;

        config =
            {
                name: fileLoadManager.name,
                fileName:fileLoadManager.name,

                format: igv.inferFileFormat(fileLoadManager.name),

                url: fileLoadManager.dictionary.data,
                indexURL: fileLoadManager.dictionary.index
            };

        return config;
    };

    app.Google =
        {
            init: function () {
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

            postInit: function () {

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

                        // $("#switchUserLink").html("Logged in as: " + username);

                    }

                }

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

            createPicker: function ($filenameContainer, index, controllerPickerCallback) {

                getAccessToken()
                    .then(function (accessToken) {

                        if (accessToken) {

                            picker = new google.picker
                                .PickerBuilder()
                                .setAppId(igv.Google.properties["project_number"])
                                .setOAuthToken(igv.oauth.google.access_token)
                                .addView( new google.picker.View(google.picker.ViewId.DOCS) )
                                .setDeveloperKey(igv.Google.properties["developer_key"])
                                .setCallback(function (data) {
                                    if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
                                        let obj;

                                        obj = app.Google.pickerCallback(data);
                                        controllerPickerCallback(obj, $filenameContainer, index);

                                    }
                                })
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

            }
        };

    return app;
})(app || {});