import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import strip from 'rollup-plugin-strip';

export default [

    {
        input: 'js/app.js',
        output: [
            {file: 'tmp/app_bundle.js', format: 'umd', name: 'igv_webapp'},
        ],
        plugins: [
            resolve(),
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
            babel({
                exclude: 'node_modules/**'
            }),
        ]
    }
];
