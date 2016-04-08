// - -------------------------------------------------------------------- - //

'use strict';

var path = require('path');

module.exports = function (grunt) {

  var env = this.getEnv();

  var gruntConfig = {

    package: grunt.file.readJSON('./package.json'),

    chmod: {
      options: {
        mode: '755'
      },
      commands: {
        src: ['commands/*.*']
      }
    },

    watch: {

      js: {
        files: env.config.src.js,
        tasks: ['development'],
        options: {
          spawn: false
        }
      },

      less: {
        files: env.config.src.less,
        tasks: ['less:development'],
        options: {
          spawn: false
        }
      }

    },

    clean: [
      path.resolve(env.config.app.client, 'react.jsx'),
      path.resolve(env.config.app.client, 'react.js'),
      path.resolve(env.config.app.client, 'index.jsx')
    ],

    concat: {

      babel: {
        src: env.config.src.jsx,
        dest: path.resolve(env.config.app.client, 'react.jsx')
      },

      development: {
        src: [].concat(env.config.src.js, path.resolve(env.config.app.client, 'react.js')),
        dest: path.resolve(env.config.app.client, 'index.js')
      },

      staging: {
        src: [].concat(env.config.src.js, path.resolve(env.config.app.client, 'react.js')),
        dest: path.resolve(env.config.app.client, 'index.js')
      }
    },

    babel: {
      development: {
        options: {
          presets: ['react']
        },
        files: [{
          src: path.resolve(env.config.app.client, 'react.jsx'),
          dest: path.resolve(env.config.app.client, 'react.js')
        }]
      }
    },

    less: {

      development: {
        files: [{
          src: env.config.src.less,
          dest: path.resolve(env.config.app.client, 'index.css')
        }]
      },

      staging: {
        options: {
          optimization: 0,
          compress: true
        },
        files: [{
          src: env.config.src.less,
          dest: path.resolve(env.config.app.client, 'index.css')
        }]
      }

    },

    uglify: {

      staging: {
        src: path.resolve(env.config.app.client, 'index.js'),
        dest: path.resolve(env.config.app.client, 'index.js')
      }

    },

    run: {}

  };

  this.eachEnv(function (env) {

    // grunt concat:index_env
    gruntConfig.concat['index_' + env.name] = {
      src: env.config.src.html,
      dest: path.resolve(env.config.app.client, 'index.html'),
      options: {
        process: {
          data: {
            package: gruntConfig.package,
            env: env
          }
        }
      }
    };

    // grunt concat:pm2_env
    gruntConfig.concat['pm2_' + env.name] = {
      src: ['.qw/pm2-server.json'],
      dest: '.qw/pm2-server-' + env.name + '.json',
      options: {
        process: {
          data: {
            package: gruntConfig.package,
            env: env
          }
        }
      }
    };

    // grunt concat:nginx_env
    gruntConfig.concat['nginx_' + env.name] = {
      src: ['.qw/nginx-server.conf'],
      dest: '.qw/nginx-server-' + env.name + '.conf',
      options: {
        process: {
          data: {
            package: gruntConfig.package,
            env: env
          }
        }
      }
    };

    // grunt run:env
    gruntConfig.run[env.name] = {
      cmd: 'pm2',
      args: [ 'restart', path.resolve(env.dir, '../.qw', 'pm2-server-' + env.name + '.json') ]
    };

    if (env.isProduction) {
      grunt.registerTask(env.name, [
        'concat:index_' + env.name,
        'concat:pm2_' + env.name,
        'concat:nginx_' + env.name,
        'production_base',
        'run:' + env.name
      ]);
    }

  });

  grunt.initConfig(gruntConfig);

  require('load-grunt-tasks')(grunt);

  grunt.registerTask('development', [
    'chmod:commands',
    'concat:index_development',
    'concat:babel',
    'babel:development',
    'concat:development',
    'less:development',
    'clean'
  ]);

  grunt.registerTask('staging', [
    'chmod:commands',
    'concat:pm2_staging',
    'concat:index_staging',
    'concat:babel',
    'babel:development',
    'concat:staging',
    'uglify:staging',
    'less:staging',
    'clean',
    'run:staging'
  ]);

  grunt.registerTask('production_base', [
    'chmod:commands',
    'concat:babel',
    'babel:development',
    'concat:staging',
    'uglify:staging',
    'less:staging',
    'clean'
  ]);

  grunt.registerTask('production', this.getProductionEnvs());
  grunt.registerTask('default', [env.name]);

};
// - -------------------------------------------------------------------- - //
