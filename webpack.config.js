const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

process.env.INDEX_FILE_SRC = '<script type="module" src="js/app.js"></script>';
process.env.INDEX_FILE_DST = '<script src="./app_bundle.js"></script>';

module.exports = env => {

    const { igvwebconfig } = env;

    console.log(`Using ${ igvwebconfig }`);

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
            rules: [
                {
                    test: /\.js$/,
                    exclude: /(node_modules|bower_components)/,
                    use: {
                        loader: "babel-loader"
                    }
                }
            ]
        },
        plugins:
            [
                new CopyPlugin([
                    { from:'css/**/*.css'   },
                    { from:'css/webfonts/*' },
                    { from:'img/*'          },
                    { from:'resources/**/*' },
                    { from:'vendor/*'       },
                    { from:'favicon.ico'    },
                    {
                        from: igvwebconfig,
                        to:'igvwebConfig.js'
                    },
                    {
                        from: 'index.html',
                        transform: (content) => { return content.toString().replace(process.env.INDEX_FILE_SRC, process.env.INDEX_FILE_DST) }
                    }
                ])

            ]
    };
};
