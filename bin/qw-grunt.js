#!/usr/bin/env node
// - -------------------------------------------------------------------- - //

'use strict';

var fs = require('fs');
var path = require('path');
var cmd = require('commander');
var output = require('./output.js');
var config = require('../lib/index.js');
var Crawler = require('bauer-crawler');
var env = config.getEnv();

// - -------------------------------------------------------------------- - //

function grunt () {

  var crawler = new Crawler({
    plugins: [
      'bauer-plugin-grunt'
    ],
    config: {
      grunt: {
        workers: 0,
        gruntFile: path.resolve(__dirname, '../lib/grunt.js')
      }
    }
  });

  crawler.start(function (promise) {
    return promise.grunt().then(output.stop).exit();
  });
}

// - -------------------------------------------------------------------- - //

cmd
  .option('-w, --watch', 'Watches for changes.')
  .action(grunt)
  .parse(process.argv);

// - -------------------------------------------------------------------- - //
