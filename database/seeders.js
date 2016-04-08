// - -------------------------------------------------------------------- - //

'use strict';

var factory = require('bauer-factory');

// - -------------------------------------------------------------------- - //

var Seeder = factory.createClass({

  constructor: function () {
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
  var seeder = new Seeder();
  if (factory.isString(env.config.app.seed)) {
    var seed = require(env.config.app.seed);
    if (factory.isFunction(seed)) {
      seed(seeder, db, env);
    } else {
      throw new Error('seed module must export a function');
    }
  } else {
    throw new Error('seed config must be a filename string');
  }
  return seeder.run(db);
};

// - -------------------------------------------------------------------- - //
