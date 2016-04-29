#!/usr/bin/env node
// - -------------------------------------------------------------------- - //

'use strict';

const cmd = require('commander');
const output = require('./output.js');
const config = require('../lib/index.js');
const database = require('../lib/db.js');
const env = config.getEnv();
const db = database(env);
const command = env.getCommand(process.argv[2]);

cmd.arguments(command.arguments);
cmd.action(() => {
  output.command(cmd);
  command.db = db;
  command.env = env;
  command.config = config;
  command.output = output;
  command.action.apply(command, cmd.rawArgs.slice(3));
});
cmd.parse(process.argv);

// - -------------------------------------------------------------------- - //
