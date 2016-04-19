#!/usr/bin/env node
// - -------------------------------------------------------------------- - //

'use strict';

var qw = require('qw');
var path = require('path');
var Crawler = require('bauer-crawler');

var tasks = process.argv.slice(2);

var crawler = new Crawler({
  plugins: [
    'bauer-plugin-grunt'
  ],
  config: {
    grunt: {
      base: path.resolve(qw.dir, '..'),
      gruntFile: path.resolve(__dirname, '../lib/grunt.js'),
      gruntPath: require.resolve('grunt')
    }
  }
});

crawler.start(function (promise) {
  return promise.grunt(tasks).exit();
});

// - -------------------------------------------------------------------- - //
