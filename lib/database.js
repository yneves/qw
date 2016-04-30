// - -------------------------------------------------------------------- - //

'use strict';

var Sequelize = require('sequelize');
var seeder = require('./seeder.js');

module.exports = class Database {

  constructor() {
    this.db = {};
  }

  get(env, subdomain) {
    const key = subdomain ? env.name + '.' + subdomain : env.name;
    if (!this.db[key]) {
      this.db[key] = this.create(env, subdomain);
    }
    return this.db[key];
  }

  create(env, subdomain) {
    const opts = env.config.database;
    const name = subdomain ? opts.name + '_' + subdomain : opts.name;
    const db = new Sequelize(name, opts.username, opts.password, opts.settings);
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
  }
}

// - -------------------------------------------------------------------- - //
