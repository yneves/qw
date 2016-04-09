#!/usr/bin/env node
// - -------------------------------------------------------------------- - //

'use strict';

var qw = require('../index.js');
var env = qw.getEnv();

env.createAppServer(function () {
  process.stdout.write('\n' + env.name + ' server running on port ' + env.getPort() + '\n');
});

// - -------------------------------------------------------------------- - //
