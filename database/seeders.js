// - -------------------------------------------------------------------- - //

'use strict';

var factory = require('bauer-factory');

// - -------------------------------------------------------------------- - //

var Seeder = factory.createClass({

  constructor: function (env) {
    this.env = env;
    this.seeds = [];
  },

  add: function (code, args) {
    this.seeds.push({
      code: code,
      args: args || []
    });
  },

  addRecords: function (model, records) {
    this.add(function (db, model, records) {
      if (factory.isFunction(records)) {
        records = records(this.env);
      }
      return db.model(model).bulkCreate(records);
    }, [model, records]);
  },

  run: function (db) {
    return new db.Promise(function (resolve, reject) {
      var next = function () {
        if (this.seeds.length) {
          var seed = this.seeds.shift();
          var args = [db].concat(seed.args);
          var promise = seed.code.apply(this, args);
          promise.then(next).catch(reject);
        } else {
          resolve();
        }
      }.bind(this);
      next();
    }.bind(this));
  }

});

// - -------------------------------------------------------------------- - //

module.exports = function (db, env) {
  var seeder = new Seeder(env);
  var seed = env.requireConfig(['app', 'seed']);
  seed(seeder, db, env);
  return seeder.run(db);
};

// - -------------------------------------------------------------------- - //
