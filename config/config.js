// - -------------------------------------------------------------------- - //

'use strict';

var fs = require('fs');
var path = require('path');
var factory = require('bauer-factory');
var grunt = require('./grunt.js');
var Environment = require('./environment.js');

// - -------------------------------------------------------------------- - //

var Config = factory.createClass({

  // new Config(dir String) :Config
  constructor: function (dir) {
    this.dir = dir;
    this.grunt = grunt.bind(this);
  },

  // .getDefaultConfig() :Object
  getDefaultConfig: function () {
    return require(path.resolve(this.dir, 'config-default.js'));
  },

  // .getEnvConfigFile(name String) :String
  getEnvConfigFile: function (name) {
    var file;
    if (name.indexOf('production_') === 0) {
      var customer = name.split('_');
      file = path.resolve(this.dir, customer[1], 'config.js');
    } else {
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

    return new Environment(name, file, this);
  },

  // .getAllEnvs() :Array
  getAllEnvs: function () {
    var dir = this.dir;
    var all = ['testing', 'development', 'staging'];
    fs.readdirSync(dir).forEach(function (item) {
      if (item !== 'default') {
        var stat = fs.statSync(path.resolve(dir, item));
        if (stat.isDirectory()) {
          if (fs.existsSync(path.resolve(dir, item, 'config.js'))) {
            all.push('production_' + item);
          }
        }
      }
    });
    return all;
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
