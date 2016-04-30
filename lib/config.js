// - -------------------------------------------------------------------- - //

'use strict';

const fs = require('fs');
const path = require('path');
const factory = require('bauer-factory');
const Environment = require('./environment.js');

// - -------------------------------------------------------------------- - //

module.exports = class Config {

  // new Config(dir String) :Config
  constructor(dir) {
    this.dir = dir;
    this.envs = {};
  }

  // .getDefaultConfig() :Object
  getDefaultConfig() {
    return require(path.resolve(this.dir, 'config-default.js'));
  }

  // .getEnvConfigFile(name String) :String
  getEnvConfigFile(name) {
    let file = path.resolve(this.dir, name, 'config.js');
    if (!fs.existsSync(file)) {
      file = path.resolve(this.dir, 'config-' + name + '.js');
    }
    return file;
  }

  // .getEnv(environment String) :Object
  getEnv(name) {
    if (name instanceof Environment) {
      return name;
    }
    if (!name) {
      name = process.env.NODE_ENV;
    }
    if (!name) {
      const parts = this.dir.split(path.sep);
      const dir = parts[parts.length - 2];
      if (/-staging$|-production_[a-z0-9]+$/i.test(dir)) {
        name = dir.split('-').pop();
      } else {
        name = 'development';
      }
    }
    const file = this.getEnvConfigFile(name);
    if (!fs.existsSync(file)) {
      throw new Error('unknown environment (' + name + ')');
    }
    if (!this.envs[name]) {
      this.envs[name] = new Environment(name, file, this);
    }
    return this.envs[name];
  }

  // .getAllEnvs() :Array
  getAllEnvs() {
    if (!this.all) {
      this.all = [];
      const dir = this.dir;
      fs.readdirSync(this.dir).forEach((item) => {
        const stat = fs.statSync(path.resolve(dir, item));
        if (stat.isFile()) {
          if (item !== 'config-default.js' && item.indexOf('config-') === 0) {
            const env = item.replace(/config-|\.js/g, '');
            if (env && this.all.indexOf(env) === -1) {
              this.all.push(env);
            }
          }
        }
      }, this);
    }
    return this.all;
  }

  // .getProductionEnvs() :Array
  getProductionEnvs() {
    return this.getAllEnvs()
      .filter((name) => (name.indexOf('production_') === 0));
  }

  // .eachEnv(callback Function) :void
  eachEnv(callback) {
    this.getAllEnvs().forEach((name) => {
      callback(this.getEnv(name));
    });
  }
}

// - -------------------------------------------------------------------- - //
