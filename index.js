// - -------------------------------------------------------------------- - //

'use strict';

var fs = require('fs');
var path = require('path');
var Config = require('./config/config.js');

var libDir = path.resolve(process.cwd(), '../qw');
var configDir = path.resolve(process.cwd(), 'config');

if (fs.existsSync(libDir) && fs.existsSync(configDir)) {
  module.exports = new Config(configDir);
} else {
  throw new Error('config not found');
}

// - -------------------------------------------------------------------- - //
