#!/usr/bin/env node
// - -------------------------------------------------------------------- - //

'use strict';

require('commander')
  .action(function () {
    var args = [path.resolve(__dirname, '../server/server.js')];
    cp.spawnSync('node', args, { stdio: 'inherit' });
  })
  .parse(process.argv);

// - -------------------------------------------------------------------- - //
