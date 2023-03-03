import StringLoader from "./stringLoader.js"

function bitlyShortener(accessToken) {

    if (!accessToken || accessToken === "BITLY_TOKEN") {
        return undefined
    } else {
        return async function (url) {
            const api = "https://api-ssl.bitly.com/v3/shorten"
            const devIP = "192.168.1.11"
            if (url.startsWith("http://localhost")) {
                url = url.replace("localhost", devIP)
            }  // Dev hack
            let endpoint = api + "?access_token=" + accessToken + "&longUrl=" + encodeURIComponent(url)
            return StringLoader.loadJson(endpoint, {})
                .then(function (json) {
                    return json.data.url
                })
        }
    }

}

function googleShortener(apiKey) {
    if (!apiKey || apiKey === "API_KEY") {
        return undefined
    } else {
        return async function (url) {
            const api = "https://www.googleapis.com/urlshortener/v1/url"
            const endpoint = api + "?key=" + apiKey
            return StringLoader
                .loadJson(endpoint, {sendData: JSON.stringify({"longUrl": url}), contentType: "application/json"})
                .then(function (json) {
                    return json.id
                })
        }
    }
}

function tinyURLShortener({endpoint}) {
    endpoint = endpoint || "https://2et6uxfezb.execute-api.us-east-1.amazonaws.com/dev/tinyurl/"
    return async function (url) {
        const enc = encodeURIComponent(url)
        const response = await fetch(`${endpoint}${enc}`)
        if (response.ok) {
            return response.text()
        } else {
            throw new Error(response.statusText)
        }
    }
}

export {bitlyShortener, googleShortener, tinyURLShortener}
