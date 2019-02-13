const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports =
    {
        mode: 'none',
        // entry: ['babel-polyfill', './build/js/app.js'],
        entry: './build/js/app.js',
        output:
            {
                path: path.resolve(__dirname, 'dist'),
                filename: 'bundle.js'
            },
        module:
            {
                rules:
                    [
                        {
                            test: /\.js$/,
                            exclude: /(node_modules|bower_components)/,
                            use:
                                {
                                    loader: 'babel-loader',
                                    options:
                                        {
                                            presets:
                                                [
                                                    '@babel/preset-env'
                                                ]
                                        }
                                }
                        }
                    ]
            },
        plugins:
            [
                new CopyWebpackPlugin([
                    { from:'css/app.css', to:'css' },
                    { from:'img/*' },
                    { from:'resources/*/*' },
                    { from:'favicon.ico' }
                ])

            ]
    };
