// - -------------------------------------------------------------------- - //

'use strict';

var fs = require('fs');
var path = require('path');
var express = require('express');
var factory = require('bauer-factory');
var api = require('./api.js');

module.exports = function (db, env) {

  var root = env.config.app.client;
  var index = path.resolve(root, 'index.html');
  var html = fs.readFileSync(index).toString();

  var app = express();
  app.use('/api', api(db, env));
  app.use(express.static(root, { index: false }));
  app.use(function (request, response) {
    response.set('Content-Type', 'text/html');
    response.send(html);
  });

  return app;
};

// - -------------------------------------------------------------------- - //
