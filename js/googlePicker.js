/**
 * Created by jrobinso on 6/2/18.
 */

function googleDoNothing () {
    console.log('google do nothing');
}

function initClient() {

    igv.Google
        .loadGoogleProperties("https://s3.amazonaws.com/igv.org.app/web_client_google")
        .then(function (properties) {
            let scope,
                config,
                reject;

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

            reject = function (reason) {
                console.log(reason);
            };

            gapi.client
                .init(config)
                .then(function () {

                        let div,
                            options,
                            browser;

                        div = $("#myDiv")[0];
                        options = {
                            genome: "hg19",
                            apiKey: igv.Google.properties["api_key"],
                            queryParametersSupported: true
                        };

                        browser = igv.createBrowser(div, options);

                        gapi.auth2
                            .getAuthInstance()
                            .isSignedIn
                            .listen(updateSigninStatus);

                        gapi.load('picker', function () {
                            document.getElementById("googlePickerButton").disabled = false;
                        });

                    },
                    reject);

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

}

// Create and render a Picker object for picking files.
function createPicker() {
    var view, accessToken;

    getAccessToken()

        .then(function (accessToken) {

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
        let url, doc, name, format, id, downloadURL;

        if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
            doc = data[google.picker.Response.DOCUMENTS][0];
            url = doc[google.picker.Document.URL];
            name = doc[google.picker.Document.NAME];
            id = doc[google.picker.Document.ID];

            format = igv.inferFileFormat(name);

            if (!format) {
                alert("Unrecognized file format: " + name);
            }
            else {

                downloadURL = "https://www.googleapis.com/drive/v3/files/" + id + "?alt=media";

                igv.browser.loadTrack({
                    url: downloadURL,
                    filename: name,
                    name: name,
                    format: format
                });

            }
        }

    }
}
