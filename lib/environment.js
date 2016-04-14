// - -------------------------------------------------------------------- - //

'use strict';

var fs = require('fs');
var path = require('path');
var https = require('https');
var http = require('http');
var express = require('express');
var factory = require('bauer-factory');

var api = require('./api.js');
var server = require('./server.js');
var database = require('./db.js');

// - -------------------------------------------------------------------- - //

var Environment = factory.createClass({

  // new Environment(name String, file String, parent Config) :Environment
  constructor: function (name, file, parent) {
    this.name = name;
    this.dir = parent.dir;
    this.defaults = parent.getDefaultConfig();
    this.isProduction = name.indexOf('production_') === 0;
    this.setConfig(file);
  },

  // .setConfig(file String) :void
  setConfig: function (file) {
    this.base = path.dirname(file);
    this.config = factory.extend({}, this.defaults, require(file));
  },

  // .getPackage() :Object
  getPackage: function () {
    var file = path.resolve(this.dir, '../package.json');
    return require(file);
  },

  // .getSSLKey() :String
  getSSLKey: function () {
    return path.resolve(this.base, this.config.ssl.key);
  },

  // .getSSLCert() :String
  getSSLCert: function () {
    return path.resolve(this.base, this.config.ssl.cert);
  },

  // .getSSLParams() :Object
  getSSLParams: function () {
    var params = {
      key: fs.readFileSync(this.getSSLKey()),
      cert: fs.readFileSync(this.getSSLCert())
    };
    if (this.config.ssl.ca) {
      var cafile = path.resolve(this.base, this.config.ssl.ca);
      params.ca = fs.readFileSync(cafile);
      params.requestCert = true;
      params.rejectUnauthorized = false;
    }
    return params;
  },

  // .getCommands(name: String) :Object
  getCommand: function (name) {
    if (factory.isObject(this.config.cmd)) {
      var file = path.resolve(this.base, this.config.cmd[name]);
      if (file && fs.existsSync(file)) {
        var cmd = require(file);
        cmd.name = name;
        Object.keys(cmd).forEach(function (key) {
          if (factory.isFunction(cmd[key])) {
            cmd[key] = cmd[key].bind(cmd);
          }
        });
        return cmd;
      }
    }
  },

  // .getCommands() :Array
  getCommands: function () {
    var commands = [];
    if (factory.isObject(this.config.cmd)) {
      Object.keys(this.config.cmd).forEach(function (name) {
        var cmd = this.getCommand(name);
        if (cmd) {
          commands.push(cmd);
        }
      }, this);
    }
    return commands;
  },

  // .requireConfig(key Array) :Function
  requireConfig: function (key) {
    var config = this.config;
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
    var file = path.resolve(this.base, config);
    var code = require(file);
    if (!factory.isFunction(code)) {
      throw new Error('module must export a function: ' + file);
    }
    return code;
  },

  // .requireFile(key Array) :Function
  requireFile: function (key) {
    var file = path.resolve.apply(path, [this.base].concat(key));
    if (!fs.existsSync(file)) {
      file = path.resolve.apply(path, [this.dir, 'default'].concat(key));
    }
    if (file === this.base || file === this.dir + '/default') {
      throw new Error('file not found: ' + file);
    }
    if (!fs.existsSync(file)) {
      throw new Error('file not found: ' + file);
    }
    var code = require(file);
    if (!factory.isFunction(code)) {
      throw new Error('module must export a function: ' + file);
    }
    return code;
  },

  // .getDb() :Sequelize
  getDb: function () {
    if (!this.db) {
      this.db = database(this);
    }
    return this.db;
  },

  // .getServerPort() :Number
  getServerPort: function () {
    return this.config.server.port;
  },

  // .getServerHost() :String
  getServerHost: function () {
    return this.config.server.host;
  },

  // .getStaticRoot() :String
  getStaticRoot: function () {
    return path.resolve(this.dir, '.qw/static-' + this.name);
  },

  // .getClientCwd() :String
  getClientCwd: function () {
    return path.resolve(this.base, this.config.client.cwd);
  },

  // .createApiServer(callback Function) :HTTPServer
  createApiServer: function (callback) {
    var db = this.getDb();
    var apiServer = express();
    apiServer.use('/api', api(db, this));
    var httpServer = http.createServer(apiServer);
    db.sync().bind(this).then(function () {
      httpServer.listen(function () {
        apiServer.set('port', httpServer.address().port);
        if (factory.isFunction(callback)) {
          callback();
        }
      });
    });
    return httpServer;
  },

  // .createServer(callback Function) :HTTPServer
  createServer: function (callback) {
    var db = this.getDb();
    var appServer = server(db, this);
    var httpsServer = https.createServer(this.getSSLParams(), appServer);
    db.sync().bind(this).then(function () {
      httpsServer.listen(this.getServerPort(), callback);
    });
    return httpsServer;
  }

});

// - -------------------------------------------------------------------- - //

module.exports = Environment;

// - -------------------------------------------------------------------- - //
