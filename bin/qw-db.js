#!/usr/bin/env node
// - -------------------------------------------------------------------- - //

'use strict';

const cmd = require('commander');
const output = require('../lib/output.js');
const config = require('../lib/index.js');
const env = config.getEnv();

// - -------------------------------------------------------------------- - //

cmd.arguments('<action> [subdomain]');
cmd.option('-s, --seed', 'Seed the database with initial data.');
cmd.option('-f, --force', 'Drops existing tables before creating new ones.');
cmd.option('-m, --model [model]', 'Model to have all records loaded and saved.');
cmd.action(action);
cmd.parse(process.argv);

// - -------------------------------------------------------------------- - //

function action(action, subdomain) {
  const db = env.getDb(subdomain);
  output.command(cmd);
  switch (action) {
    case 'sync':
      sync(db);
      break;
    case 'refresh':
      refresh(db);
      break;
  }
}

function sync(db) {
  db.sync({
    force: cmd.force,
    seed: cmd.seed
  });
}

function refresh(db) {
  if (!cmd.model || !db.model(cmd.model)) {
    throw new Error('invalid model ' + cmd.model);
  }
  const model = db.model(cmd.model);
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
