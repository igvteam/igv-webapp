import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import strip from 'rollup-plugin-strip';
import commonjs from 'rollup-plugin-commonjs';
import {terser} from "rollup-plugin-terser"

export default [

    {
        input: 'js/app.js',
        output: [
            {file: 'dist/app_bundle.js', format: 'umd', name: 'igv_webapp'},
            {file: 'dist/app_bundle.min.js', format: 'umd', name: 'igv_webapp', sourcemap: true}
        ],
        plugins: [
            strip({
                // set this to `false` if you don't want to
                // remove debugger statements
                debugger: true,

                // defaults to `[ 'console.*', 'assert.*' ]`
                functions: ['console.log', 'assert.*', 'debug'],

                // set this to `false` if you're not using sourcemaps –
                // defaults to `true`
                sourceMap: false
            }),
            commonjs(),
            resolve(),
            babel(),
            terser({
                include: [/^.+\.min\.js$/],
                sourcemap: {
                    filename: "app_bundle.min.js",
                    url: "app_bundle.min.js.map"
                }})
        ]
    }
];
