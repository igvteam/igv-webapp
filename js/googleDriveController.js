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

    app.GoogleDriveController.prototype.configure = function (okHandler, dataFileOnly = false) {

        let self = this,
            loaderConfig,
            $dismiss,
            $ok;

        loaderConfig =
            {
                hidden: false,
                embed: true,
                $widgetParent: this.$modal.find('.modal-body'),
                // mode: 'url',
                mode: 'localFile'
            };

        this.loader = this.browser.createFileLoadWidget(loaderConfig, new igv.FileLoadManager());

        this.loader.customizeLayout(function ($parent) {

            $parent.find('.igv-flw-file-chooser-container').hide();

            if (true === dataFileOnly) {
                makeButton.call(self, $parent.find('.igv-flw-input-label').first(), 0);
                $parent.find('.igv-flw-input-row').last().hide();
            } else {
                $parent.find('.igv-flw-input-label').each(function (index) {
                    makeButton.call(self, $(this), index);
                });
            }

            function makeButton($e, index) {
                let $div,
                    lut,
                    settings;

                // insert Dropbox button container
                $div = $('<div>');
                $div.insertAfter( $e );

                // create Dropbox button
                lut =
                    [
                        'data',
                        'index'
                    ];

                settings = dbButtonConfigurator.call(self, $e.parent().find('.igv-flw-local-file-name-container'), lut[ index ]);
                $div.get(0).appendChild( Dropbox.createChooseButton(settings) )
            }
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
            okHandler(self.loader, self.$modal);
        });

    };

    function dbButtonConfigurator($trackNameLabel, key) {
        let self = this,
            obj;
        obj =
            {

                success: function(dbFiles) {
                    // Single file selection only
                    $trackNameLabel.text(dbFiles[ 0 ].name);
                    $trackNameLabel.show();
                    self.loader.fileLoadManager.dictionary[ key ] = dbFiles[ 0 ].link;
                },

                cancel: function() { },

                linkType: "preview",
                multiselect: false,
                folderselect: false,
            };

        return obj;
    }

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

            createPicker: function () {

                getAccessToken()
                    .then(function (accessToken) {
                        let view;

                        if (accessToken) {

                            view = new google.picker.View(google.picker.ViewId.DOCS);
                            picker = new google.picker
                                .PickerBuilder()
                                .setAppId(igv.Google.properties["project_number"])
                                .setOAuthToken(igv.oauth.google.access_token)
                                .addView(view)
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
        };

    return app;
})(app || {});