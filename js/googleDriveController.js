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

    app.GoogleDriveController = function (browser, $modal, dataTitle = 'Data') {
        this.browser = browser;
        this.$modal = $modal;
        this.dataTitle = dataTitle;
    };

    app.GoogleDriveController.prototype.configure = function (filePickerHandler, okHandler) {

        let self = this,
            loaderConfig,
            $dismiss,
            $ok;

        loaderConfig =
            {
                dataTitle: this.dataTitle,
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

                // widen button
                $(this).css({ width:'200px' });
                $div = $('<div>', { class: 'igv-app-modal-google-drive-logo' });
                $(this).append($div);

                $filenameContainer = $(this).parent().find('.igv-flw-local-file-name-container');

                $(this).on('click', function (e) {
                    self.$modal.modal('hide');
                    app.Google.createPicker($filenameContainer, index, filePickerHandler);
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
            okHandler(self.loader.fileLoadManager);
            self.loader.dismiss();
            self.$modal.modal('hide');
        });

    };

    app.Google =
        {
            init: function ($googleAccountSwitchButton) {

                this.$googleAccountSwitchButton = $googleAccountSwitchButton;

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

            createPicker: function ($filenameContainer, index, controllerFilePickerHandler) {

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
                                        let obj;

                                        obj = app.Google.pickerCallback(data);

                                        controllerFilePickerHandler(obj, $filenameContainer, index);

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

                    this.$googleAccountSwitchButton.find('span').text(username);
                    this.$googleAccountSwitchButton.show();
                }

            }

        };

    return app;
})(app || {});