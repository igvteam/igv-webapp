// index.html
/*
annotation-config = 
{
    id: 'annotation-selector',
    items: 'https://hicfiles.s3.amazonaws.com/internal/tracksMenu_$GENOME_ID.txt'
};
*/

// app.js
genomeChangeListener = 
{

    receiveEvent: function (event) {
        var genomeId = event.data;

        if (lastGenomeId !== genomeId) {

            if (config.trackMenu) {
                var tracksURL = config.trackMenu.items.replace("$GENOME_ID", genomeId);
                loadAnnotationSelector($('#' + config.trackMenu.id), tracksURL, "1D");
            }

            createEncodeTable(genomeId);
        }
    }
};


function loadAnnotationSelector($container, url, type) {

    var elements;

    $container.empty();

    elements = [];
    elements.push('<option value=' + '-' + '>' + '-' + '</option>');

    igv.xhr
        .loadString(url)
        .then(function (data) {
            var lines = data ? data.splitLines() : [];
            lines.forEach(function (line) {
                var tokens = line.split('\t');
                if (tokens.length > 1 && ("2D" === type || igvSupports(tokens[1]))) {
                    elements.push('<option value=' + tokens[1] + '>' + tokens[0] + '</option>');
                }
            });
            $container.append(elements.join(''));

        })
        .catch(function (error) {
            console.log("Error loading track menu: " + url + "  " + error);
        })
}
