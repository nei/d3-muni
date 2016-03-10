
module.exports = function(grunt) {
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
        watch: {
            sass: {
                files: 'client/assets/css/*.scss',
                tasks: ['sass', 'cssmin']
            }
        },
        cssmin: {
            my_target: {
                files:[{
                    expand: true,
                    // establishes the root directory for the 'src' array
                    cwd: 'client/assets/css/',
                    src: ['*.css', '!*.min.css'],
                    dest: 'client/assets/css/',
                    ext: '.min.css'
                }]
            }
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

    // here we need to load the plugins that we are using
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-bower');

    // here we say what tasks to complete in the second argument, we pass the tasks from our initConfig func above
    grunt.registerTask('default', [ 'bower', 'sass', 'cssmin', 'watch']);
}