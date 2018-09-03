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

    grunt.registerTask('default', 'Webpack rocks', ['webpack:prod']);
    grunt.registerTask('index', 'string-replace:dist');

};


