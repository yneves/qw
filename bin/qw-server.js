#!/usr/bin/env node
// - -------------------------------------------------------------------- - //

'use strict';

var qw = require('../lib/index.js');
var env = qw.getEnv();

var server = env.createServer(function () {
  process.stdout.write('\n' + env.name + ' server running on port ' + server.address().port + '\n');
});

// - -------------------------------------------------------------------- - //
