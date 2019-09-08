// script for injecting api keys into igv web config

const fs = require('fs');

const args = process.argv;
let clientId;
let apiKey;
let bitlyToken;
for (let a of args) {
    if (a.startsWith("--clientId=")) {
        clientId = a.substr(11);
    } else if (a.startsWith("--apiKey=")) {
        apiKey = a.substr(9);
    } else if (a.startsWith("--bitlyToken=")) {
        bitlyToken = a.substr(13);
    }
}

if (bitlyToken || apiKey || clientId) {
    let contents = fs.readFileSync('igvwebConfig.js', 'utf-8');
    if (bitlyToken) {
        contents = contents.replace('BITLY_TOKEN', bitlyToken);
    }
    if (apiKey) {
        contents = contents.replace('API_KEY', apiKey);
    }
    if (clientId) {
        contents = contents.replace("CLIENT_ID", clientId);
    }
    fs.writeFileSync('igvwebConfig.js', contents, 'utf-8');
}
