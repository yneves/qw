#!/usr/bin/env node
// - -------------------------------------------------------------------- - //

'use strict';

var fs = require('fs');
var cp = require('child_process');
var path = require('path');
var cwd = path.resolve(process.cwd(), 'node_modules/qw/commands/qw.js');
var dir = path.dirname(__dirname);

// already in the current project
if (cwd.indexOf(dir) === 0) {
  require('commander')
    .command('db <action>', 'database tools')
    .command('schema <action> <schema>', 'add/remove/update schemas')
    // .command('event <action> <code> [text]', 'add/remove/list event records')
    // .command('department <action> <department>', 'add/remove/list department records')
    .command('deploy <target>', 'deployment tool')
    .command('server', 'run local server')
    .parse(process.argv);

// forward the call to the current project's qw command
} else if (fs.existsSync(cwd)) {
  var args = [path.resolve(cwd)].concat(process.argv.slice(2));
  cp.spawnSync('node', args, { stdio: 'inherit' });

} else {
  throw new Error('must call from project directory');
}


// - -------------------------------------------------------------------- - //
