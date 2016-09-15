fs = require 'fs'

env = {}
try
  file = fs.readFileSync '.env', 'utf8'
  arr = file.split('\n')
  arr.pop() if not arr[arr.length]
  for item in arr
    key = item.split('=')[0]
    val = item.split('=')[1]
    env[key] = val
catch e

module.exports = (grunt) ->
  grunt.initConfig
    less:
      all:
        options:
          paths: ['./dist/css']
          compress: true
        files:
          './dist/css/main.css': './src/less/main.less'
    coffee:
      compile:
        files:
          './dist/js/app.js': [
            './src/iced/main.iced'
            './src/iced/vault.iced',
            './src/iced/archivist.iced',
          ]
    browserify:
      './dist/js/bundle.js': ['./dist/js/app.js']
      options:
        exclude: ['openpgp']
        transform: ['coffeeify', 'vueify']
        browserifyOptions:
          extensions: '.iced'
          paths: ['./src/iced']
    copy:
      lib:
        expand: true
        flatten: true
        cwd: './'
        src: [
          'node_modules/openpgp/dist/openpgp.min.js'
          'node_modules/openpgp/dist/openpgp.worker.min.js'
        ]
        dest: 'dist/js/'
    watch:
      iced:
        files: ['./**/*.iced']
        tasks: ['coffee']
      less:
        files: ['./**/*.less']
        tasks: ['less']
        options: {livereload: true}
      vue:
        files: ['./**/*.vue']
        tasks: ['browserify']
        options: {livereload: true}
      html:
        files: ['./**/*.htm*']
        options: {livereload: true}
      js:
        files: ['./dist/js/app.js']
        tasks: ['browserify']
        options: {livereload: true}

  grunt.loadNpmTasks 'grunt-contrib-less'
  grunt.loadNpmTasks 'grunt-iced-coffee'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-browserify'
  grunt.loadNpmTasks 'grunt-contrib-copy'

  grunt.registerTask 'dev', ['less', 'coffee', 'copy', 'browserify', 'watch']
  grunt.registerTask 'default', ['less', 'coffee', 'copy', 'browserify']
