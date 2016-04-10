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
        src: [path.resolve(__dirname, '../commands/*.*')]
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
    if (env.config.deploy.pm2) {
      gruntConfig.concat['pm2_' + env.name] = {
        src: [path.resolve(env.dir, env.config.deploy.pm2)],
        dest: path.resolve(env.dir, '.qw/pm2-server-' + env.name + '.json'),
        options: {
          process: {
            data: {
              package: gruntConfig.package,
              env: env
            }
          }
        }
      };
    }

    // grunt concat:nginx_env
    if (env.config.deploy.nginx) {
      gruntConfig.concat['nginx_' + env.name] = {
        src: [path.resolve(env.dir, env.config.deploy.nginx)],
        dest: path.resolve(env.dir, '.qw/nginx-server-' + env.name + '.conf'),
        options: {
          process: {
            data: {
              package: gruntConfig.package,
              env: env
            }
          }
        }
      };
    }

    // grunt run:env
    if (env.config.deploy.pm2) {
      gruntConfig.run[env.name] = {
        cmd: 'pm2',
        args: [ 'restart', path.resolve(env.dir, '.qw/pm2-server-' + env.name + '.json') ]
      };
    }

    if (env.isProduction) {
      grunt.registerTask(env.name, [
        'concat:index_' + env.name,
        env.config.deploy.pm2 ? 'concat:pm2_' + env.name : null,
        env.config.deploy.nginx ? 'concat:nginx_' + env.name : null,
        'production_base',
        env.config.deploy.pm2 ? 'run:' + env.name : null
      ].filter(function (task) { return !!task }));
    }

  });

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
    'concat:index_development',
    'concat:babel',
    'babel:development',
    'concat:development',
    'less:development',
    'clean'
  ]);

  var staging = this.getEnv('staging');
  grunt.registerTask('staging', [
    'chmod:commands',
    staging.config.deploy.pm2 ? 'concat:pm2_staging' : null,
    'concat:index_staging',
    'concat:babel',
    'babel:development',
    'concat:staging',
    'uglify:staging',
    'less:staging',
    'clean',
    staging.config.deploy.pm2 ? 'run:staging' : null
  ].filter(function (task) { return !!task }));

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
