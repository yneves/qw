#!/usr/bin/env node
// - -------------------------------------------------------------------- - //

'use strict';

var fs = require('fs');
var cp = require('child_process');
var path = require('path');
var cmd = require('commander');
var cwd = path.resolve(process.cwd(), 'node_modules/qw/bin/qw.js');
var dir = path.dirname(__dirname);

// already in the current project
if (cwd.indexOf(dir) === 0) {

  var config = require('../lib/index.js');
  var env = config.getEnv();
  env.getCommands().forEach(function (command) {
    cmd.command(command.name + ' ' + command.arguments, command.description);
    delete cmd._execs[command.name];
  });

  cmd.command('db <action>', 'database tools');
  cmd.command('deploy <target>', 'deployment tool');
  cmd.command('server', 'run local server');
  cmd.defaultExecutable = 'command.js';
  cmd.parse(process.argv);

// forward the call to the current project's qw command
} else if (fs.existsSync(cwd)) {
  var args = [path.resolve(cwd)].concat(process.argv.slice(2));
  cp.spawnSync('node', args, { stdio: 'inherit' });

} else {
  throw new Error('must call from project directory');
}


// - -------------------------------------------------------------------- - //
