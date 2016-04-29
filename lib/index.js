// - -------------------------------------------------------------------- - //

'use strict';

const fs = require('fs');
const path = require('path');
const Config = require('./config.js');

const libDir = path.resolve(process.cwd(), 'node_modules/qw');
const configDir = path.resolve(process.cwd(), 'config');

if (fs.existsSync(libDir) && fs.existsSync(configDir)) {
  module.exports = new Config(configDir);
} else {
  throw new Error('config not found');
}

// - -------------------------------------------------------------------- - //
