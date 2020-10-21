import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import strip from 'rollup-plugin-strip';
import commonjs from 'rollup-plugin-commonjs';
import {terser} from "rollup-plugin-terser"
const pkg = require('./package.json');

export default [

    {
        input: 'js/app.js',
        output: [
            {file: `dist/app_bundle-${pkg.version}.js`, format: 'umd', name: 'igv_webapp'},
            {file: `dist/app_bundle-${pkg.version}.min.js`, format: 'umd', name: 'igv_webapp', sourcemap: true, plugins: [terser()]}
        ],
        plugins: [
            strip({
                // set this to `false` if you don't want to
                // remove debugger statements
                debugger: true,

                // defaults to `[ 'console.*', 'assert.*' ]`
                functions: ['console.log', 'assert.*', 'debug'],
            }),
            commonjs(),
            resolve(),
            babel()
        ]
    }
];
