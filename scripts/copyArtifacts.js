#!/usr/bin/env node

const fs = require('fs-extra');
const pkg = require('../package.json');

const distDir = __dirname + '/../dist';
const filesToCopy = [
    { src: '/../igvwebConfig.js', dest: '/igvwebConfig.js' },
    { src: '/../css/app.css', dest: '/css/app.css' },
    { src: '/../css/webfonts', dest: '/css/webfonts' },
    { src: '/../css/fontawesome', dest: '/css/fontawesome' },
    { src: '/../img', dest: '/img' },
    { src: '/../resources', dest: '/resources' },
    { src: '/../favicon.ico', dest: '/favicon.ico' }
];

filesToCopy.forEach(file => {
    fs.copySync(__dirname + file.src, distDir + file.dest);
});

const indexPath = __dirname + '/../index.html';
const updatedIndex = fs.readFileSync(indexPath, 'utf-8')
    .replace('src="js/app.js"', `src="./app_bundle-${pkg.version}.esm.min.js"`);

fs.writeFileSync(distDir + '/index.html', updatedIndex, 'utf-8');
