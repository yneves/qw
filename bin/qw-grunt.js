#!/usr/bin/env node
// - -------------------------------------------------------------------- - //

'use strict';

const path = require('path');
const grunt = require('grunt');
const config = require('../lib/index.js');

const tasks = process.argv.slice(2);
const options = {
  base: path.resolve(config.dir, '..'),
  gruntfile: path.resolve(__dirname, '../lib/grunt.js')
};

grunt.tasks(tasks, options);

// - -------------------------------------------------------------------- - //
