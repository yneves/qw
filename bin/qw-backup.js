#!/usr/bin/env node
// - -------------------------------------------------------------------- - //

'use strict';

var fs = require('fs');
var path = require('path');
var cmd = require('commander');
var output = require('./output.js');
var config = require('../lib/index.js');
var Crawler = require('bauer-crawler');
var env = config.getEnv();

// - -------------------------------------------------------------------- - //

function backup (target) {

  var crawler = new Crawler({
    plugins: [
      'bauer-plugin-rsync',
      'bauer-plugin-ssh'
    ]
  });

  crawler.start(function (promise) {

    var targetEnv = config.getEnv(target);
    var database = targetEnv.config.database.name;
    var privateKey = targetEnv.config.deploy.key;
    var sourceDir = targetEnv.config.deploy.source;
    var remoteDir = targetEnv.config.deploy.target;
    var remoteAddr = targetEnv.config.deploy.host;
    var remoteUser = targetEnv.config.deploy.user;
    var localFile = path.resolve(sourceDir, database + '-backup.sql');
    var remoteFile = path.resolve(remoteDir, database + '-backup.sql');

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
  .action(function (target) {
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
