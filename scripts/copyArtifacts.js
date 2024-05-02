#!/usr/bin/env node

const fs = require('fs-extra');
const pkg = require('../package.json');

fs.copySync(__dirname + '/../igvwebConfig.js', __dirname + '/../dist/igvwebConfig.js');
fs.copySync(__dirname + '/../css/app.css', __dirname + '/../dist/css/app.css');
fs.copySync(__dirname + '/../css/webfonts', __dirname + '/../dist/css/webfonts');
fs.copySync(__dirname + '/../css/fontawesome', __dirname + '/../dist/css/fontawesome');
fs.copySync(__dirname + '/../img', __dirname + '/../dist/img');
fs.copySync(__dirname + '/../resources', __dirname + '/../dist/resources');
fs.copySync(__dirname + '/../favicon.ico', __dirname + '/../dist/favicon.ico');

const indexPath =  __dirname + '/../index.html';
let ping = fs.readFileSync(indexPath, 'utf-8');
const lines = ping.split(/\r?\n/);

const out = __dirname + '/../dist/index.html';
var fd = fs.openSync(out, 'w');

let written = false;
for (let line of lines) {

    if(!written && line.includes("<script") && line.includes("module") && line.includes("app.js")) {
        fs.writeSync(fd, '\t<script src=./app_bundle-' + pkg.version + '.js></script>\n', null, 'utf-8');
        written = true;
    } else {
        fs.writeSync(fd, line + '\n', null, 'utf-8')
    }
}
