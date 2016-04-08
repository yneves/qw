#!/usr/bin/env node
// - -------------------------------------------------------------------- - //

'use strict';

var cp = require('child_process');
var path = require('path');
var args = [path.resolve(__dirname, '../server/server.js')];
cp.spawnSync('node', args, { stdio: 'inherit' });

// - -------------------------------------------------------------------- - //
