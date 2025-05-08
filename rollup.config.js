import strip from 'rollup-plugin-strip';
import {terser} from "rollup-plugin-terser"
const pkg = require('./package.json');

export default [

    {
        input: 'js/app.js',
        output: [
            {file: `dist/app_bundle-${pkg.version}.esm.js`, format: 'es'},
            {file: `dist/app_bundle-${pkg.version}.esm.min.js`, format: 'es', sourcemap: true, plugins: [terser()]}
        ],
        plugins: [
            strip({
                // set this to `false` if you don't want to
                // remove debugger statements
                debugger: true,

                // defaults to `[ 'console.*', 'assert.*' ]`
                functions: ['console.log', 'assert.*', 'debug'],
            }),
        ]
    }
];
