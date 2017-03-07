module.exports = function (grunt) {

  'use strict';

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    clean: {

      dist: {

        src: ['dist']
      }
    },

    uglify: {

      dist: {

        files: {

          'dist/scripts/main.min.js': [
            'src/scripts/modules/utils.js',
            'src/scripts/modules/navigation.js',
            'src/scripts/modules/marginals.js',
            'src/scripts/modules/scroll.js',
            'src/scripts/modules/modal.js',
            'src/scripts/init.js'
          ]
        }
      }
    },

    concat: {

      dist: {

        options: {

          separator: '\n'
        },

        src: [
          'node_modules/video.js/dist/video.min.js',
          'node_modules/videojs-contrib-hls/dist/videojs-contrib-hls.min.js',
          'dist/scripts/main.min.js'
        ],

        dest: 'dist/scripts/main.min.js'
      }
    },

    sass: {

      options: {

        sourceMap: true
      },

      dist: {

        files: {

          'src/styles/main.css': 'src/styles/main.scss'
        }
      }
    },

    postcss: {

      options: {

        processors: [

          require('autoprefixer')({

            browsers: ['> 5%', 'last 2 versions', 'IE 7', 'IE 8', 'IE 9']
          }),

          require('cssnano')()
        ],
        map: true
      },

      dist: {

        files: {

          'dist/styles/main.min.css': 'src/styles/main.css'
        }
      }
    },

    copy: {

      dist: {

        files: [

          { expand: true, flatten: true, src: ['src/index.html'], dest: 'dist/', filter: 'isFile' },
          { expand: true, flatten: true, src: ['src/preview.jpg'], dest: 'dist/', filter: 'isFile' },
          { expand: true, flatten: true, src: ['src/favicon.ico'], dest: 'dist/', filter: 'isFile' },
          { expand: true, cwd: 'src/fonts/', src: ['**/*'], dest: 'dist/fonts/' },
          { expand: true, cwd: 'src/images/', src: ['**/*'], dest: 'dist/images/' },
          { expand: true, cwd: 'src/charts/', src: ['**/*'], dest: 'dist/charts/' }
        ]
      }
    },

    useminPrepare: {

      html: 'src/index.html'
    },

    usemin: {

      html: 'dist/index.html'
    },

    watch: {

      css: {

        files: 'src/styles/**/*.scss',
        tasks: ['sass', 'postcss']
      }
    }
  });

  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-postcss');
  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('dist', ['clean', 'useminPrepare', 'uglify', 'concat', 'sass', 'postcss', 'copy', 'usemin']);
};
