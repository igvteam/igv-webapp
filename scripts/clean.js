#!/usr/bin/env node
const fs = require('fs-extra');

fs.emptyDirSync(__dirname + '/../dist');
fs.emptyDirSync(__dirname + '/../tmp');