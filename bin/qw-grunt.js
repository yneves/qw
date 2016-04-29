#!/usr/bin/env node
// - -------------------------------------------------------------------- - //

'use strict';

const qw = require('qw');
const path = require('path');
const grunt = require('grunt');

const tasks = process.argv.slice(2);
const options = {
  base: path.resolve(qw.dir, '..'),
  gruntfile: path.resolve(__dirname, '../lib/grunt.js')
};

grunt.tasks(tasks, options);

// - -------------------------------------------------------------------- - //
