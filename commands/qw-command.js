#!/usr/bin/env node
// - -------------------------------------------------------------------- - //

'use strict';

var cmd = require('commander');
var output = require('./output.js');
var config = require('../lib/index.js');
var database = require('../lib/db.js');
var env = config.getEnv();
var db = database(env);
var command = env.getCommand(process.argv[2]);

cmd.arguments(command.arguments);
cmd.action(function () {
  output.command(cmd);
  command.db = db;
  command.env = env;
  command.config = config;
  command.output = output;
  command.action.apply(command, cmd.args.slice(1));
});
cmd.parse(process.argv);

// - -------------------------------------------------------------------- - //
