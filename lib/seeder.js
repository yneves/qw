// - -------------------------------------------------------------------- - //

'use strict';

const factory = require('bauer-factory');

// - -------------------------------------------------------------------- - //

class Seeder {

  constructor (env) {
    this.env = env;
    this.seeds = [];
  }

  add (code, args) {
    this.seeds.push({
      code: code,
      args: args || []
    });
  }

  addRecords (model, records) {
    this.add((db, model, records) => {
      if (factory.isFunction(records)) {
        records = records(this.env);
      }
      return db.model(model).bulkCreate(records);
    }, [model, records]);
  }

  run (db) {
    return new db.Promise((resolve, reject) => {
      const next = () => {
        if (this.seeds.length) {
          const seed = this.seeds.shift();
          const args = [db].concat(seed.args);
          const promise = seed.code.apply(this, args);
          promise.then(next).catch(reject);
        } else {
          resolve();
        }
      };
      next();
    });
  }

}

// - -------------------------------------------------------------------- - //

module.exports = function (db, env) {
  const seeder = new Seeder(env);
  if (env.config.database.seed) {
    const seed = env.getDatabaseSeed();
    seed(seeder, db, env);
  }
  return seeder.run(db);
};

// - -------------------------------------------------------------------- - //
