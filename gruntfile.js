'use strict';

module.exports = function(grunt) {

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        // initConfig takes an object
        // in this object, we list all the tasks that we want to run

        pkg: grunt.file.readJSON('package.json'),

        bower: {
            dev: {
                dest: 'client/assets/libs/',
                options: {
                    expand: true
                }
            }
        },
        compress: {
            main: {
                options: {
                    mode: 'gzip'
                },
                files: [{
                    expand: true, 
                    cwd: 'client/assets/json', 
                    src: ['all.json'], 
                    dest: 'client/assets/json',
                    ext: '.json.gz'
            }]
          }
        },
        watch: {
            sass: {
                files: 'client/assets/css/*.scss',
                tasks: ['sass', 'cssmin']
            }
        },
        cssmin: {
            target: {
                files:[{
                    expand: true,
                    cwd: 'client/assets/css/',
                    src: ['*.css', '!*.min.css'],
                    dest: 'client/assets/css/',
                    ext: '.min.css'
                }]
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                ignores: 'client/assets'
            },
            all: [
                'Gruntfile.js',
                'server.js',
                'client/app/**/*.js',
                '!**/load-d3.service.js'
            ]
        },
        sass: {
            dist: {
                options: {
                    style: 'expanded',
                    sourceMap: false
                },
                files: {
                    'client/assets/css/style.css' : 'client/assets/css/*.scss'
                }
            }
        }
    });

    // here we say what tasks to complete in the second argument, we pass the tasks from our initConfig func above
    grunt.registerTask('default', [ 'compress', 'jshint', 'bower', 'sass', 'cssmin', 'watch']);
};