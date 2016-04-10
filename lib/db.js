// - -------------------------------------------------------------------- - //

'use strict';

var factory = require('bauer-factory');
var Sequelize = require('sequelize');
var seeder = require('./seeder.js');

module.exports = function (env) {

  var opts = env.config.database;
  var db = new Sequelize(opts.name, opts.username, opts.password, opts.settings);

  var dbSync = db.sync;
  db.sync = function (syncOpts) {
    return dbSync.call(db, syncOpts).then(function (ret) {
      var promise = ret;
      if (syncOpts && syncOpts.seed) {
        promise = seeder(db, env).then(function () {
          return ret;
        });
      }
      return promise;
    });
  };

  if (env.config.database.schema) {
    var schema = env.requireConfig(['database', 'schema']);
    schema(db, Sequelize, env);
  }

  return db;
};

// - -------------------------------------------------------------------- - //
