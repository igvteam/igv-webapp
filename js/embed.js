function embedJS() {

    var div, query, shortURL;

    div = document.getElementById("igvDiv");
    query = extractQuery(window.location.href);

    shortURL = query["shortURL"];

    expandURL(shortURL)

        .then(function (expandedURL) {

            var config, query2;

            query2 = extractQuery(expandedURL);
            config = Object.assign(query, query2);
            config.queryParametersSupported = true;


            igv.createBrowser(div, config);
        });


    function expandURL(shortURL) {

        if(shortURL) {
            return app.expandURL(shortURL);
        }
        else {
            return Promise.resolve(window.location.href);
        }

    }


    function extractQuery(uri) {

        var i1, i2, i, j, s, query, tokens, uri, key, value;

        query = {};
        i1 = uri.indexOf("?");
        i2 = uri.lastIndexOf("#");

        if (i1 >= 0) {
            if (i2 < 0) i2 = uri.length;
            for (i = i1 + 1; i < i2;) {
                j = uri.indexOf("&", i);
                if (j < 0) j = i2;

                s = uri.substring(i, j);
                tokens = s.split("=", 2);

                if (tokens.length === 2) {
                    key = tokens[0];
                    value = decodeURIComponent(tokens[1]);
                    query[key] = value;
                }
                
                i = j + 1;
            }
        }

        return query;
    }

}