#!/usr/bin/env node
// - -------------------------------------------------------------------- - //

'use strict';

var cmd = require('commander');
var output = require('./output.js');
var config = require('../lib/index.js');
var database = require('../lib/db.js');
var env = config.getEnv();
var db = database(env);

// - -------------------------------------------------------------------- - //

function sync () {
  db.sync({
    force: cmd.force,
    seed: cmd.seed
  });
}

function refresh () {
  if (!cmd.model || !db.model(cmd.model)) {
    throw new Error('invalid model ' + cmd.model);
  }
  var model = db.model(cmd.model);
  model.describe().then(function (fields) {
    model.findAll().map(function (row) {
      Object.keys(fields).forEach(function (field) {
        row.set(field, row.get(field));
      });
      return row.save();
    });
  });
}

// - -------------------------------------------------------------------- - //

cmd
  .arguments('<action>')
  .option('-s, --seed', 'Seed the database with initial data.')
  .option('-f, --force', 'Drops existing tables before creating new ones.')
  .option('-a, --amount [amount]', 'Amount of sample data to be created.')
  .option('-m, --model [model]', 'Model to have all records loaded and saved.')
  .action(function (action) {

    output.command(cmd);

    switch (action) {

      case 'sync':
        sync();
        break;

      case 'refresh':
        refresh();
        break;
    }
  })
  .parse(process.argv);

// - -------------------------------------------------------------------- - //
