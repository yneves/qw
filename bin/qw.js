#!/usr/bin/env node
// - -------------------------------------------------------------------- - //

'use strict';

const fs = require('fs');
const cp = require('child_process');
const path = require('path');
const cmd = require('commander');
const cwd = path.resolve(process.cwd(), 'node_modules/qw-cli/bin/qw.js');
const dir = path.dirname(__dirname);

// already in the current project
if (cwd.indexOf(dir) === 0) {

  const config = require('../lib/index.js');
  const env = config.getEnv();
  env.getCommands().forEach((command) => {
    cmd.command(command.name + ' ' + command.arguments, command.description);
    delete cmd._execs[command.name];
  });

  cmd.command('db <action>', 'Database tools');
  cmd.command('backup <target>', 'Backup tool');
  cmd.command('deploy <target>', 'Deployment tool');
  cmd.command('grunt', 'Run grunt');
  cmd.command('server', 'Run local server');
  cmd.defaultExecutable = 'command.js';
  cmd.parse(process.argv);

// forward the call to the current project's qw command
} else if (fs.existsSync(cwd)) {
  const args = [path.resolve(cwd)].concat(process.argv.slice(2));
  cp.spawnSync('node', args, { stdio: 'inherit' });

} else {
  throw new Error('must call from project directory');
}


// - -------------------------------------------------------------------- - //
