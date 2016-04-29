#!/usr/bin/env node
// - -------------------------------------------------------------------- - //

'use strict';

const spinner = require('loading-spinner');
const env = require('../lib/index.js').getEnv();
const pkg = env.getPackage();

function print(params) {

  if (typeof params === 'string') {
    process.stdout.write(params + '\n');

  } else if (params instanceof Array) {
    process.stdout.write(params.join(', ') + '\n');

  } else if (typeof params === 'object') {
    Object.keys(params).forEach(function (key) {
      const label = key.substr(0, 1).toUpperCase() + key.substr(1);
      process.stdout.write(label + ': ' + params[key] + '\n');
    });
  }
}

function printCommand(cmd) {

  const info = {
    package: pkg.name,
    version: pkg.version,
    environment: env.name,
    command: cmd._name
  };

  const args = [];
  const rawArgs = cmd.rawArgs.slice(2);
  const indexAdd = 0;

  cmd._args.forEach(function (arg, index) {
    if (cmd._name === 'qw-command' && index === 0) {
      info.command = rawArgs[index];
      indexAdd = 1;
    }
    args.push({
      name: arg.name,
      value: rawArgs[index + indexAdd]
    });
  });

  args.forEach(function (arg) {
    info[arg.name] = arg.value;
  });

  print('');
  print(info);
  print('');
}

function start() {
  spinner.start(100, {
    clearChar: true,
    clearLine: true,
    doNotBlock: true,
    hideCursor: true
  });
}

function stop() {
  spinner.stop();
}


module.exports = {
  print: print,
  command: printCommand,
  start: start,
  stop: stop
};

// - -------------------------------------------------------------------- - //
