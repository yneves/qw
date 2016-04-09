// - -------------------------------------------------------------------- - //

'use strict';

var fs = require('fs');
var path = require('path');
var https = require('https');
var http = require('http');
var express = require('express');
var factory = require('bauer-factory');

var api = require('../server/api.js');
var app = require('../server/app.js');
var database = require('../database/index.js');

// - -------------------------------------------------------------------- - //

var Environment = factory.createClass({

  // new Environment(name String, file String, parent Config) :Environment
  constructor: function (name, file, parent) {
    this.name = name;
    this.dir = parent.dir;
    this.defaults = parent.getDefaultConfig();
    this.isProduction = name.indexOf('production_') === 0;
    if (this.isProduction) {
      this.customer = name.split('_')[1];
    } else {
      this.customer = 'default';
    }
    this.setConfig(file);
  },

  // .setConfig(file String) :void
  setConfig: function (file) {
    this.base = path.dirname(file);
    this.config = factory.extend({}, this.defaults, require(file));
  },

  // .getSSLParams() :Object
  getSSLParams: function () {
    var params = {
      key: fs.readFileSync(this.config.ssl.key),
      cert: fs.readFileSync(this.config.ssl.cert)
    };
    if (this.config.ssl.ca) {
      params.ca = fs.readFileSync(this.config.ssl.ca);
      params.requestCert = true;
      params.rejectUnauthorized = false;
    }
    return params;
  },

  // .getCommands(name: String) :Object
  getCommand: function (name) {
    if (factory.isObject(this.config.cmd)) {
      var file = this.config.cmd[name];
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
    var file = path.resolve(this.dir, config);
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

  // .createDb() :Sequelize
  createDb: function () {
    return database(this);
  },

  // .getPort() :Number
  getPort: function () {
    return this.config.app.port;
  },

  // .createApiServer(callback Function) :HTTPServer
  createApiServer: function (callback) {
    var db = this.createDb();
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

  // .createAppServer(callback Function) :HTTPServer
  createAppServer: function (callback) {
    var db = this.createDb();
    var appServer = app(db, this);
    var httpsServer = https.createServer(this.getSSLParams(), appServer);
    db.sync().bind(this).then(function () {
      httpsServer.listen(this.getPort(), callback);
    });
    return httpsServer;
  }

});

// - -------------------------------------------------------------------- - //

module.exports = Environment;

// - -------------------------------------------------------------------- - //
