const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

process.env.INDEX_FILE_SRC = '<script type="module" src="js/app.js"></script>';
process.env.INDEX_FILE_DST = '<script src="./app_bundle.js"></script>';

const client_id_regex = /CLIENT_ID/gi;
const api_key_regex = /API_KEY/gi;
const bitly_token_regex = /BITLY_TOKEN/gi;

module.exports = env => {

    const { production } = env;
    const str = production || 'not_production';

    console.log(`production ${ str }`);

    return {
        mode: 'none',
        entry:
            {
                app_bundle: './js/app.js',
            },
        output:
            {
                path: path.resolve(__dirname, 'dist'),
                filename: '[name].js'
            },
        module: {
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
                new CopyPlugin([
                    { from:'css/**/*.css'    },
                    { from:'css/webfonts/*'  },
                    { from:'img/*'           },
                    { from:'resources/**/*'  },
                    { from:'vendor/*'        },
                    { from:'favicon.ico'     },
                    {
                        from: 'igvwebConfig.js',
                        transform: (content) => {
                            return content.toString()
                                .replace(client_id_regex, '661332306814-8nt29308rppg325bkq372vli8nm3na14.apps.googleusercontent.com')
                                .replace(api_key_regex, 'AIzaSyDUUAUFpQEN4mumeMNIRWXSiTh5cPtUAD0')
                                .replace(bitly_token_regex, '76670dc60b519eaf9be4fc1c227b4f3e3b3a5e2')
                        }
                    },
                    {
                        from: 'index.html',
                        transform: (content) => { return content.toString().replace(process.env.INDEX_FILE_SRC, process.env.INDEX_FILE_DST) }
                    }
                ])

            ]
    };
};
