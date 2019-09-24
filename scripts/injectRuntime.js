#!/usr/bin/env node

const fs = require('fs');

const igvPath = __dirname + '/../tmp/app_bundle.js';
let ping = fs.readFileSync(igvPath, 'utf-8');
const lines = ping.split(/\r?\n/);

const templatePath = __dirname +'/regeneratorRuntime.js';
let foo = fs.readFileSync(templatePath, 'utf-8');

const out = __dirname + '/../dist/app_bundle.js';
let regenWritten = false;
var fd = fs.openSync(out, 'w');

for (let line of lines) {
    fs.writeSync(fd, line + '\n', null, 'utf-8')
    if(line.trim().length === 0 && !regenWritten) {
        fs.writeSync(fd, foo, null, 'utf-8');
        regenWritten = true;
    }
}

fs.closeSync(fd);
fs.unlinkSync(igvPath)
