module.exports = function(grunt) {

    var fs = require('fs');

    var pkg = grunt.file.readJSON('package.json');

    var dynamicWrites = function(){

        // Update Readme Version
        var readme = grunt.file.read('README.md');
        grunt.file.write('README.md', readme.replace(/v(.*?) /, 'v'+pkg.version+' '));
        grunt.log.writeln("Updated Readme version number to "+pkg.version);

    };

    grunt.initConfig({

        pkg: pkg,

        sass: {
            dist: {
                options: {
                    bundleExec: true,
                    style: 'compressed',
                    banner: "/* Snap.css v<%= pkg.version %> */"
                },
                files: {
                    'dist/latest/snap.css': 'src/css/snap.scss'
                }
            }
        },

        concat: {
            options: {
                banner: "/*! Snap.js v<%= pkg.version %> */\n"
            },
            dist: {
                src: [
                    'src/js/snap.js',
                    'src/js/utils.js',
                    'src/js/action.js',
                    'src/js/api.js'
                ],
                dest: 'dist/latest/snap.js'
            }
        },

        copy: {
            main: {
                files: [
                    // Version our latest files
                    {src: ['dist/latest/snap.js'], dest: 'dist/<%= pkg.version %>/snap.js'},
                    {src: ['dist/latest/snap.css'], dest: 'dist/<%= pkg.version %>/snap.css'}
                ]
            }
        },

        uglify: {
            options: {
                preserveComments: 'some'
            },
            main: {
                files: {
                    'dist/latest/snap.js': ['dist/latest/snap.js']
                }
            }
        },

        jshint: {
            all: ['src/js/*.js']
        },

        watch: {
            css: {
                files: 'src/css/*.scss',
                tasks: ['sass', 'copy', 'dynamicWrites']
            },
            scripts: {
                files: 'src/js/*.js',
                tasks: ['jshint', 'concat', 'uglify', 'copy', 'dynamicWrites']
            }
        }
    });

    grunt.loadTasks('tasks');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // Register Everything
    grunt.registerTask('dynamicWrites', 'Writes variables to static files', dynamicWrites);

    grunt.registerTask('default', ['jshint', 'sass', 'concat', 'uglify', 'copy', 'dynamicWrites']);
    grunt.registerTask('develop', ['jshint', 'sass', 'concat', 'uglify', 'copy', 'dynamicWrites', 'watch']);
};
