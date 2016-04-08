#!/usr/bin/env node
// - -------------------------------------------------------------------- - //

'use strict';

var fs = require('fs');
var path = require('path');
var cmd = require('commander');
var output = require('./output.js');
var config = require('../index.js');
var Crawler = require('bauer-crawler');
var env = config.getEnv();

// - -------------------------------------------------------------------- - //

function deploy (target) {

  var crawler = new Crawler({
    plugins: [
      'bauer-plugin-rsync',
      'bauer-plugin-ssh'
    ],
    config: {
      rsync: {
        workers: 0
      },
      ssh: {
        workers: 0
      }
    }
  });

  crawler.start(function (promise) {

    var targetEnv = config.getEnv(target);
    var privateKey = targetEnv.config.deploy.key;
    var remoteDir = targetEnv.config.deploy.dir;
    var remoteAddr = targetEnv.config.deploy.host;
    var remoteUser = targetEnv.config.deploy.user;

    var exclude = ['.git', 'node_modules'].concat(targetEnv.config.deploy.ignore);

    promise = promise.rsync({
      source: path.resolve(__dirname, '../') + '/*',
      destination: remoteUser + '@' + remoteAddr + ':' + remoteDir,
      exclude: exclude,
      flags: 'avr',
      shell: 'ssh -2 -p 22  -i ' + privateKey
    });

    var exec = [];
    if (cmd.npm || cmd.full) {
      exec.push('cd ' + remoteDir + ' && rm -rf node_modules && npm install');
    }
    if (cmd.db || cmd.full) {
      exec.push('cd ' + remoteDir + ' && qw db sync');
    }
    if (cmd.grunt || cmd.full) {
      exec.push('cd ' + remoteDir + ' && grunt ' + target);
    }

    if (exec.length) {
      promise = promise.ssh({
        host: remoteAddr,
        username: remoteUser,
        privateKey: fs.readFileSync(privateKey).toString(),
        exec: exec
      });
    }

    return promise.then(output.stop).exit();
  });

}

// - -------------------------------------------------------------------- - //

cmd
  .arguments('<target>')
  .option('-f, --full', 'Runs npm, db sync and grunt.')
  .option('--npm', 'Runs npm install.')
  .option('--db', 'Runs db sync.')
  .option('--grunt', 'Runs grunt.')
  .action(function (target) {
    if (env.name !== 'development') {
      throw new Error('must deploy from development environment');
    }
    if (cmd.args.length === 2) {
      output.command(cmd);
      output.start();
    }
    deploy(target);
  })
  .parse(process.argv);

// - -------------------------------------------------------------------- - //
