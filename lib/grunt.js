// - -------------------------------------------------------------------- - //

'use strict';

var qw = require('./index.js');
var path = require('path');

module.exports = function (grunt) {

  var env = qw.getEnv();

  var gruntConfig = {

    chmod: {
      options: {
        mode: '755'
      },
      commands: {
        src: [path.resolve(__dirname, '../bin/*.*')]
      }
    },

    watch: {

      js: {
        files: [].concat(env.config.client.js, env.config.client.jsx).map(function (src) {
          return src.indexOf('/') === 0 ? src : env.getClientCwd() + '/' + src;
        }),
        tasks: [
          'concat:babel',
          'babel:client',
          'concat:client',
          'clean:after',
          'less:uncompressed'
        ],
        options: {
          spawn: false
        }
      },

      less: {
        files: [env.getClientCwd() + '/**/*.less'],
        tasks: ['less:uncompressed'],
        options: {
          spawn: false
        }
      },

      server: {
        files: [env.getServerCwd() + '/**/*.js', env.getDatabaseCwd() + '/**/*.js'],
        tasks: ['stop:devserver', 'run:devserver'],
        options: {
          spawn: false
        }
      }

    },

    clean: {
      after: [
        path.resolve(env.getStaticRoot(), 'react.jsx'),
        path.resolve(env.getStaticRoot(), 'react.js'),
        path.resolve(env.getStaticRoot(), 'index.jsx')
      ],
      before: [
        env.getStaticRoot() + '/*'
      ]
    },

    copy: {
      client: {
        files: [{
          cwd: env.getClientCwd(),
          src: env.config.client.assets,
          dest: env.getStaticRoot() + '/',
          expand: true
        }]
      }
    },

    concat: {

      babel: {
        src: [].concat(env.config.client.jsx).map(function (src) {
          return src.indexOf('/') === 0 ? src : env.getClientCwd() + '/' + src;
        }),
        dest: path.resolve(env.getStaticRoot(), 'react.jsx')
      },

      client: {
        src: [].concat(env.config.client.js, path.resolve(env.getStaticRoot(), 'react.js')).map(function (src) {
          return src.indexOf('/') === 0 ? src : env.getClientCwd() + '/' + src;
        }),
        dest: path.resolve(env.getStaticRoot(), 'index.js')
      },

      index: {
        src: [].concat(env.config.client.html).map(function (src) {
          return src.indexOf('/') === 0 ? src : env.getClientCwd() + '/' + src;
        }),
        dest: path.resolve(env.getStaticRoot(), 'index.html'),
        options: {
          process: {
            data: {
              package: env.getPackage(),
              env: env
            }
          }
        }
      },

      pm2: {
        src: [path.resolve(env.dir, env.config.deploy.pm2)],
        dest: path.resolve(env.dir, '.qw/pm2-server-' + env.name + '.json'),
        options: {
          process: {
            data: {
              package: env.getPackage(),
              env: env
            }
          }
        }
      },

      nginx: {
        src: [path.resolve(env.dir, env.config.deploy.nginx)],
        dest: path.resolve(env.dir, '.qw/nginx-server-' + env.name + '.conf'),
        options: {
          process: {
            data: {
              package: env.getPackage(),
              env: env
            }
          }
        }
      }
    },

    stop: {
      devserver: {}
    },
    wait: {
      devserver: {}
    },

    run: {
      pm2server: {
        cmd: 'pm2',
        args: [ 'startOrRestart', path.resolve(env.dir, '.qw/pm2-server-' + env.name + '.json') ]
      },
      devserver: {
        cmd: 'node',
        args: [ path.resolve(__dirname, '../bin/qw-server.js') ],
        options: {
          wait: false
        }
      }
    },

    babel: {
      client: {
        options: {
          presets: ['es2015', 'react']
        },
        files: [{
          src: path.resolve(env.getStaticRoot(), 'react.jsx'),
          dest: path.resolve(env.getStaticRoot(), 'react.js')
        }]
      }
    },

    less: {

      uncompressed: {
        files: [{
          src: [].concat(env.config.client.less).map(function (src) {
            return src.indexOf('/') === 0 ? src : env.getClientCwd() + '/' + src;
          }),
          dest: path.resolve(env.getStaticRoot(), 'index.css')
        }]
      },

      compressed: {
        options: {
          optimization: 0,
          compress: true
        },
        files: [{
          src: [].concat(env.config.client.less).map(function (src) {
            return src.indexOf('/') === 0 ? src : env.getClientCwd() + '/' + src;
          }),
          dest: path.resolve(env.getStaticRoot(), 'index.css')
        }]
      }

    },

    uglify: {
      client: {
        src: path.resolve(env.getStaticRoot(), 'index.js'),
        dest: path.resolve(env.getStaticRoot(), 'index.js')
      }
    }

  };

  grunt.initConfig(gruntConfig);

  grunt.loadNpmTasks('grunt-run');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-chmod');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('development', [
    'stop:devserver',
    // 'chmod:commands',
    'clean:before',
    'concat:index',
    'concat:babel',
    'babel:client',
    'concat:client',
    'less:uncompressed',
    'copy:client',
    'clean:after',
    'run:devserver',
    'watch'
  ]);

  grunt.registerTask('production', [
    'chmod:commands',
    env.config.deploy.pm2 ? 'concat:pm2' : null,
    'clean:before',
    'concat:index',
    'concat:babel',
    'babel:client',
    'concat:client',
    'uglify:client',
    'less:compressed',
    'copy:client',
    'clean:after',
    env.config.deploy.pm2 ? 'run:pm2server' : null
  ].filter(function (task) { return !!task }));

  grunt.registerTask('staging', ['production']);
  grunt.registerTask('default', [env.name]);

};
// - -------------------------------------------------------------------- - //
