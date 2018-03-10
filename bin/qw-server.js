#!/usr/bin/env node
// - -------------------------------------------------------------------- - //

'use strict';

const qw = require('../lib/index.js');
const env = qw.getEnv();

const server = env.createServer(() => {
  process.stdout.write('\n' + env.name + ' server running on port ' + server.address().port + '\n');
});

// - -------------------------------------------------------------------- - //
