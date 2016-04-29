// - -------------------------------------------------------------------- - //

'use strict';

var factory = require('bauer-factory');
var Sequelize = require('sequelize');
var seeder = require('./seeder.js');

module.exports = function db (env) {

  const opts = env.config.database;
  const db = new Sequelize(opts.name, opts.username, opts.password, opts.settings);

  const dbSync = db.sync;
  db.sync = function (syncOpts) {
    return dbSync.call(db, syncOpts).then((ret) => {
      let promise = ret;
      if (syncOpts && syncOpts.seed) {
        promise = seeder(db, env).then(() => (ret));
      }
      return promise;
    });
  };

  if (env.config.database.schema) {
    const schema = env.requireConfig(['database', 'schema']);
    schema(db, Sequelize, env);
  }

  return db;
};

// - -------------------------------------------------------------------- - //
