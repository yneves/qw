#!/usr/bin/env node
// - -------------------------------------------------------------------- - //

'use strict';

const fs = require('fs');
const path = require('path');
const cmd = require('commander');
const output = require('./output.js');
const config = require('../lib/index.js');
const Crawler = require('bauer-crawler');
const env = config.getEnv();

// - -------------------------------------------------------------------- - //

function deploy(target) {

  const crawler = new Crawler({
    plugins: [
      'bauer-plugin-rsync',
      'bauer-plugin-ssh'
    ]
  });

  crawler.start((promise) => {

    const targetEnv = config.getEnv(target);
    const privateKey = targetEnv.config.deploy.key;
    const sourceDir = targetEnv.config.deploy.source;
    const remoteDir = targetEnv.config.deploy.target;
    const remoteAddr = targetEnv.config.deploy.host;
    const remoteUser = targetEnv.config.deploy.user;

    const exclude = ['.git', 'node_modules'].concat(targetEnv.config.deploy.ignore);

    promise = promise.rsync({
      source: path.resolve(sourceDir) + '/*',
      destination: remoteUser + '@' + remoteAddr + ':' + remoteDir,
      exclude: exclude,
      flags: 'avr',
      shell: 'ssh -2 -p 22  -i ' + privateKey
    });

    const exec = [];
    if (cmd.npm || cmd.full) {
      exec.push('cd ' + remoteDir + ' && rm -rf node_modules && npm install');
    }
    if (cmd.db || cmd.full) {
      exec.push('cd ' + remoteDir + ' && qw db sync');
    }
    if (cmd.grunt || cmd.full) {
      exec.push('cd ' + remoteDir + ' && qw grunt');
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
  .action((target) => {
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
