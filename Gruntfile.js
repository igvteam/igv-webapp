const webpackConfig = require('./webpack.config.js');

module.exports = function (grunt) {

    grunt.initConfig({
        webpack:
            {
                options:
                    {
                        stats: !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
                    },
                prod: webpackConfig,
                dev: Object.assign({watch: true}, webpackConfig)
            },

        'string-replace': {
            dist: {
                files: {
                    'dist/index.html': 'index.html'
                },
                options: {
                    replacements: [
                        {
                            pattern: '<script type="module" src="js/app.js"></script>',
                            replacement: ''
                        },
                        {
                            pattern: '<!--bundle-->',
                            replacement: '<script src="bundle.js"></script>'
                        }]
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-webpack');
    grunt.loadNpmTasks('grunt-string-replace');

    grunt.registerTask('default', ['inject-apikeys', 'webpack:prod', 'string-replace:dist']);

    grunt.task.registerTask('inject-apikeys', 'Inject API keys', function () {

        var bitlyToken = grunt.option('bitlyToken');
        var apiKey = grunt.option('apiKey');
        var clientId = grunt.option('clientId');

        var contents;

        contents = grunt.file.read('js/app.js');

        if(bitlyToken) {
            contents = contents.replace('BITLY_TOKEN', bitlyToken);
        }
        if(apiKey) {
            contents = contents.replace('API_KEY', apiKey);
        }
        if(clientId) {
            contents = contents.replace("CLIENT_ID", clientId);
        }

        grunt.file.write('js/app.js', contents);
    });

};


