// - -------------------------------------------------------------------- - //

'use strict';

var Sequelize = require('sequelize');
var seeder = require('./seeder.js');

module.exports = class Database {

  constructor() {
    this.db = {};
  }

  get(env, subdomain) {
    const opts = env.config.database;
    const name = subdomain && opts.multi ? opts.name + '_' + subdomain : opts.name;
    if (!this.db[name]) {
      this.db[name] = this.create(env, subdomain);
    }
    return this.db[name];
  }

  create(env, subdomain) {
    const opts = env.config.database;
    const name = subdomain && opts.multi ? opts.name + '_' + subdomain : opts.name;
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
      const schema = env.getDatabaseSchema();
      schema(db, Sequelize, env);
    }
    return db;
  }
}

// - -------------------------------------------------------------------- - //
