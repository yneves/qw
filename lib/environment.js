// - -------------------------------------------------------------------- - //

'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const express = require('express');
const factory = require('bauer-factory');

const api = require('./api.js');
const server = require('./server.js');
const Database = require('./database.js');

// - -------------------------------------------------------------------- - //

module.exports = class Environment {

  // new Environment(name String, file String, parent Config) :Environment
  constructor (name, file, parent) {
    this.name = name;
    this.dir = parent.dir;
    this.defaults = parent.getDefaultConfig();
    this.db = new Database();
    this.setConfig(file);
  }

  // .setConfig(file String) :void
  setConfig (file) {
    this.base = path.dirname(file);
    this.config = factory.extend({}, this.defaults, require(file));
  }

  // .getPackage() :Object
  getPackage () {
    const file = path.resolve(this.dir, '../package.json');
    return require(file);
  }

  // .getSSLKey() :String
  getSSLKey () {
    return path.resolve(this.base, this.config.ssl.key);
  }

  // .getSSLCert() :String
  getSSLCert () {
    return path.resolve(this.base, this.config.ssl.cert);
  }

  // .getSSLParams() :Object
  getSSLParams () {
    const params = {
      key: fs.readFileSync(this.getSSLKey()),
      cert: fs.readFileSync(this.getSSLCert())
    };
    if (this.config.ssl.ca) {
      const cafile = path.resolve(this.base, this.config.ssl.ca);
      params.ca = fs.readFileSync(cafile);
      params.requestCert = true;
      params.rejectUnauthorized = false;
    }
    return params;
  }

  // .getCommands(name: String) :Object
  getCommand (name) {
    if (factory.isObject(this.config.cmd)) {
      const file = path.resolve(this.base, this.config.cmd[name]);
      if (file && fs.existsSync(file)) {
        const cmd = require(file);
        cmd.name = name;
        Object.keys(cmd).forEach(function (key) {
          if (factory.isFunction(cmd[key])) {
            cmd[key] = cmd[key].bind(cmd);
          }
        });
        return cmd;
      }
    }
  }

  // .getCommands() :Array
  getCommands () {
    const commands = [];
    if (factory.isObject(this.config.cmd)) {
      Object.keys(this.config.cmd).forEach(function (name) {
        const cmd = this.getCommand(name);
        if (cmd) {
          commands.push(cmd);
        }
      }, this);
    }
    return commands;
  }

  // .requireConfig(key Array) :Function
  requireConfig (key) {
    let config = this.config;
    if (factory.isArray(key)) {
      key.forEach(function (k) {
        if (!config[k]) {
          throw new Error('config not found: ' + key.join('.'));
        }
        config = config[k];
      });
      key = key.join('.');
    } else if (factory.isString(key)) {
      if (!config[key]) {
        throw new Error('config not found: ' + key);
      }
      config = config[key];
    }
    if (!config || config === this.config) {
      throw new Error('config not found: ' + key.join('.'));
    }
    const file = path.resolve(this.base, config);
    const code = require(file);
    if (!factory.isFunction(code)) {
      throw new Error('module must export a function: ' + file);
    }
    return code;
  }

  // .requireFile(key Array) :Function
  requireFile (key) {
    let file = path.resolve.apply(path, [this.base].concat(key));
    if (!fs.existsSync(file)) {
      file = path.resolve.apply(path, [this.dir, 'default'].concat(key));
    }
    if (file === this.base || file === this.dir + '/default') {
      throw new Error('file not found: ' + file);
    }
    if (!fs.existsSync(file)) {
      throw new Error('file not found: ' + file);
    }
    const code = require(file);
    if (!factory.isFunction(code)) {
      throw new Error('module must export a function: ' + file);
    }
    return code;
  }

  // .getDb(subdomain) :Sequelize
  getDb (subdomain) {
    return this.db.get(this, subdomain);
  }

  // .getServerPort() :Number
  getServerPort () {
    return this.config.server.port;
  }

  // .getServerHost() :String
  getServerHost () {
    return this.config.server.host;
  }

  // .getTemp() :String
  getTemp () {
    return path.resolve(this.dir, '.qw');
  }

  // .getStaticRoot() :String
  getStaticRoot () {
    return path.resolve(this.dir, '.qw/static-' + this.name);
  }

  // .getClientCwd() :String
  getClientCwd () {
    return path.resolve(this.base, this.config.client.cwd);
  }

  // .getDatabaseCwd() :String
  getDatabaseCwd () {
    return path.resolve(this.base, this.config.database.cwd);
  }

  // .getDatabaseSchema() :String
  getDatabaseSchema () {
    const file = path.resolve(this.getDatabaseCwd(), this.config.database.schema);
    if (!fs.existsSync(file)) {
      throw new Error('schema not found');
    }
    return require(file);
  }

  // .getDatabaseSeed() :String
  getDatabaseSeed () {
    const file = path.resolve(this.getDatabaseCwd(), this.config.database.seed);
    if (!fs.existsSync(file)) {
      throw new Error('seed not found');
    }
    return require(file);
  }

  // .getServerCwd() :String
  getServerCwd () {
    return path.resolve(this.base, this.config.server.cwd);
  }

  // .getServerApi() :String
  getServerApi () {
    const file = path.resolve(this.getServerCwd(), this.config.server.api);
    if (!fs.existsSync(file)) {
      throw new Error('api not found');
    }
    return require(file);
  }

  // .createApiServer(callback Function) :HTTPServer
  createApiServer (callback) {
    const apiServer = express();
    apiServer.use('/api', api(this));
    apiServer.set('trust proxy', true);
    const httpServer = http.createServer(apiServer);
    httpServer.listen(() => {
      apiServer.set('port', httpServer.address().port);
      if (factory.isFunction(callback)) {
        callback();
      }
    });
    return httpServer;
  }

  // .createServer(callback Function) :HTTPServer
  createServer (callback) {
    const appServer = server(this);
    const httpsServer = https.createServer(this.getSSLParams(), appServer);
    httpsServer.listen(this.getServerPort(), callback);
    return httpsServer;
  }

}

// - -------------------------------------------------------------------- - //
