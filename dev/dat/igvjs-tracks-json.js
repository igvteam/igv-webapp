document.addEventListener("DOMContentLoaded", function () {

    createTrackList(document.getElementById('trackList'))
        .then(function (igore) {
            return igv.Google.loadGoogleProperties("https://s3.amazonaws.com/igv.org.app/web_client_google")
        })
        .then(function (google) {

            const igvDiv = document.getElementById("igvDiv");

            const options = {
                locus: 'myc',
                genome: "hg19",
                flanking: 1000,
                queryParametersSupported: true
            };

            igv.createBrowser(igvDiv, options);

        })
});

function createTrackList(div) {

    return igv.xhr
        .loadJson("testTracks.json")
        .then(function (tracks) {

            tracks.forEach(function (track) {

                var trackDiv, name;

                if (track.HEADING) {
                    div.insertAdjacentHTML("beforeend", "<div style='cursor:default;background:lightgrey;color:black;margin-left:0; font-weight:bold;font-size: larger'>" + track.HEADING + "</div>");
                } else {
                    trackDiv = document.createElement('div');
                    trackDiv.innerHTML = track.name;
                    trackDiv.addEventListener('click', function (event) {

                        // Convert to json to insure we can load json representations (not strictly neccessary).
                        igv.browser.loadTrack( JSON.stringify(track) );

                    });

                    div.appendChild(trackDiv);
                }

            })

            return (tracks);

        })
}
