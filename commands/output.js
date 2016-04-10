#!/usr/bin/env node
// - -------------------------------------------------------------------- - //

'use strict';

var spinner = require('loading-spinner');
var pkg = require('../package.json');
var env = require('../lib/index.js').getEnv();

function print (params) {

  if (typeof params === 'string') {
    process.stdout.write(params + '\n');

  } else if (params instanceof Array) {
    process.stdout.write(params.join(', ') + '\n');

  } else if (typeof params === 'object') {
    Object.keys(params).forEach(function (key) {
      var label = key.substr(0, 1).toUpperCase() + key.substr(1);
      process.stdout.write(label + ': ' + params[key] + '\n');
    });
  }
}

function printCommand (cmd) {

  var args = {
    package: pkg.name,
    version: pkg.version,
    environment: env.name,
    command: cmd._name
  };
  cmd._args.forEach(function (arg, index) {
    args[arg.name] = cmd.args[index];
  });

  print('');
  print(args);
  print('');
}

function start () {
  spinner.start(100, {
    clearChar: true,
    clearLine: true,
    doNotBlock: true,
    hideCursor: true
  });
}

function stop () {
  spinner.stop();
}


module.exports = {
  print: print,
  command: printCommand,
  start: start,
  stop: stop
};

// - -------------------------------------------------------------------- - //
