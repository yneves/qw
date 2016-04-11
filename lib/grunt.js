// - -------------------------------------------------------------------- - //

'use strict';

var path = require('path');

module.exports = function (grunt) {

  var env = this.getEnv();

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
        files: [].concat(env.config.client.js).map(function (src) {
          return src.indexOf('/') === 0 ? src : env.getClientCwd() + '/' + src;
        }),
        tasks: ['development'],
        options: {
          spawn: false
        }
      },

      less: {
        files: [].concat(env.config.client.less).map(function (src) {
          return src.indexOf('/') === 0 ? src : env.getClientCwd() + '/' + src;
        }),
        tasks: ['less:uncompressed'],
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

    run: {
      server: {
        cmd: 'pm2',
        args: [ 'restart', path.resolve(env.dir, '.qw/pm2-server-' + env.name + '.json') ]
      }
    },

    babel: {
      client: {
        options: {
          presets: ['react']
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
    },

    run: {}

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
    'chmod:commands',
    'clean:before',
    'concat:index',
    'concat:babel',
    'babel:client',
    'concat:client',
    'less:uncompressed',
    'copy:client',
    'clean:after'
  ]);

  var staging = this.getEnv('staging');
  grunt.registerTask('staging', [
    'chmod:commands',
    staging.config.deploy.pm2 ? 'concat:pm2' : null,
    'clean:before',
    'concat:index',
    'concat:babel',
    'babel:client',
    'concat:client',
    'uglify:client',
    'less:compressed',
    'clean:after',
    staging.config.deploy.pm2 ? 'run:server' : null
  ].filter(function (task) { return !!task }));

  grunt.registerTask('production_base', [
    'chmod:commands',
    'clean:before',
    'concat:babel',
    'babel:client',
    'concat:client',
    'uglify:client',
    'less:compressed',
    'clean:after'
  ]);

  this.eachEnv(function (env) {
    if (env.isProduction) {
      grunt.registerTask(env.name, [
        'concat:index',
        env.config.deploy.pm2 ? 'concat:pm2' : null,
        env.config.deploy.nginx ? 'concat:nginx' : null,
        'production_base',
        env.config.deploy.pm2 ? 'run:server' : null
      ].filter(function (task) { return !!task }));
    }
  });

  grunt.registerTask('production', this.getProductionEnvs());
  grunt.registerTask('default', [env.name]);

};
// - -------------------------------------------------------------------- - //
