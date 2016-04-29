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

function backup(target) {

  const crawler = new Crawler({
    plugins: [
      'bauer-plugin-rsync',
      'bauer-plugin-ssh'
    ]
  });

  crawler.start((promise) => {

    const targetEnv = config.getEnv(target);
    const database = targetEnv.config.database.name;
    const privateKey = targetEnv.config.deploy.key;
    const sourceDir = targetEnv.config.deploy.source;
    const remoteDir = targetEnv.config.deploy.target;
    const remoteAddr = targetEnv.config.deploy.host;
    const remoteUser = targetEnv.config.deploy.user;
    const localFile = path.resolve(sourceDir, database + '-backup.sql');
    const remoteFile = path.resolve(remoteDir, database + '-backup.sql');

    return promise.ssh({
        host: remoteAddr,
        username: remoteUser,
        privateKey: fs.readFileSync(privateKey).toString(),
        exec: [
          'rm -rf ' + remoteFile,
          'mysqldump ' + database + ' > ' + remoteFile
        ]
      })
      .rsync({
        source: remoteUser + '@' + remoteAddr + ':' + remoteFile,
        destination: localFile,
        flags: 'chavzP',
        shell: 'ssh -2 -p 22  -i ' + privateKey
      })
      .then(output.stop)
      .exit();
  });

}

// - -------------------------------------------------------------------- - //

cmd
  .arguments('<target>')
  .action((target) => {
    if (env.name !== 'development') {
      throw new Error('must backup from development environment');
    }
    if (cmd.args.length === 2) {
      output.command(cmd);
      output.start();
    }
    backup(target);
  })
  .parse(process.argv);

// - -------------------------------------------------------------------- - //
