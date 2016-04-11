#!/usr/bin/env node
// - -------------------------------------------------------------------- - //

'use strict';

var qw = require('qw');
var cmd = require('commander');
var path = require('path');
var Crawler = require('bauer-crawler');

function grunt (tasks) {
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
    return promise.grunt(tasks).exit();
  });
}

cmd.action(function () {
  grunt(cmd.args);
});
cmd.parse(process.argv);

// - -------------------------------------------------------------------- - //
