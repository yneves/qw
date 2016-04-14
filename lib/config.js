// - -------------------------------------------------------------------- - //

'use strict';

var fs = require('fs');
var path = require('path');
var factory = require('bauer-factory');
var Environment = require('./environment.js');

// - -------------------------------------------------------------------- - //

var Config = factory.createClass({

  // new Config(dir String) :Config
  constructor: function (dir) {
    this.dir = dir;
    this.envs = {};
  },

  // .getDefaultConfig() :Object
  getDefaultConfig: function () {
    return require(path.resolve(this.dir, 'config-default.js'));
  },

  // .getEnvConfigFile(name String) :String
  getEnvConfigFile: function (name) {
    var file = path.resolve(this.dir, name, 'config.js');
    if (!fs.existsSync(file)) {
      file = path.resolve(this.dir, 'config-' + name + '.js');
    }
    return file;
  },

  // .getEnv(environment String) :Object
  getEnv: function (name) {
    if (name instanceof Environment) {
      return name;
    }
    if (!name) {
      name = process.env.NODE_ENV;
    }
    if (!name) {
      var parts = this.dir.split(path.sep);
      var dir = parts[parts.length - 2];
      if (/-staging$|-production_[a-z0-9]+$/i.test(dir)) {
        name = dir.split('-').pop();
      } else {
        name = 'development';
      }
    }
    var file = this.getEnvConfigFile(name);
    if (!fs.existsSync(file)) {
      throw new Error('unknown environment (' + name + ')');
    }
    if (!this.envs[name]) {
      this.envs[name] = new Environment(name, file, this);
    }
    return this.envs[name];
  },

  // .getAllEnvs() :Array
  getAllEnvs: function () {
    if (!this.all) {
      this.all = [];
      var dir = this.dir;
      fs.readdirSync(this.dir).forEach(function (item) {
        var stat = fs.statSync(path.resolve(dir, item));
        if (stat.isFile()) {
          if (item !== 'config-default.js' && item.indexOf('config-') === 0) {
            var env = item.replace(/config-|\.js/g, '');
            if (env && this.all.indexOf(env) === -1) {
              this.all.push(env);
            }
          }
        }
      }, this);
    }
    return this.all;
  },

  // .getProductionEnvs() :Array
  getProductionEnvs: function () {
    return this.getAllEnvs().filter(function (name) {
      return name.indexOf('production_') === 0;
    });
  },

  // .eachEnv(callback Function) :void
  eachEnv: function (callback) {
    this.getAllEnvs().forEach(function (name) {
      callback(this.getEnv(name));
    }, this);
  }

});

// - -------------------------------------------------------------------- - //

module.exports = Config;

// - -------------------------------------------------------------------- - //
