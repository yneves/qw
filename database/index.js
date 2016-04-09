// - -------------------------------------------------------------------- - //

'use strict';

var factory = require('bauer-factory');
var Sequelize = require('sequelize');
var config = require('../index.js');
var seeders = require('./seeders.js');

module.exports = function (env) {

  var opts = env.config.database;
  var db = new Sequelize(opts.name, opts.username, opts.password, opts.settings);

  var dbSync = db.sync;
  db.sync = function (syncOpts) {
    return dbSync.call(db, syncOpts).then(function (ret) {
      var promise = ret;
      if (syncOpts && syncOpts.seed) {
        promise = seeders(db, env).then(function () {
          return ret;
        });
      }
      return promise;
    });
  };

  if (factory.isString(env.config.app.schema)) {
    var schema = require(env.config.app.schema);
    if (factory.isFunction(schema)) {
      schema(db, Sequelize, env);
    } else {
      throw new Error('schema module must export a function');
    }
  } else {
    throw new Error('schema config must be a filename string');
  }

  return db;
};

// - -------------------------------------------------------------------- - //
