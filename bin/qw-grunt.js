#!/usr/bin/env node
// - -------------------------------------------------------------------- - //

'use strict';

var qw = require('qw');
var path = require('path');
var Crawler = require('bauer-crawler');

var crawler = new Crawler({
  plugins: [
    'bauer-plugin-grunt'
  ],
  config: {
    grunt: {
      workers: 0,
      base: path.resolve(qw.dir, '..'),
      gruntFile: path.resolve(__dirname, '../lib/grunt.js'),
      gruntPath: require.resolve('grunt')
    }
  }
});

crawler.start(function (promise) {
  return promise.grunt('default').exit();
});

// - -------------------------------------------------------------------- - //
