// - -------------------------------------------------------------------- - //

'use strict';

var fs = require('fs');
var path = require('path');
var express = require('express');
var factory = require('bauer-factory');
var database = require('../database/index.js');

module.exports = function (env) {

  var db = database(env);
  var root = env.config.app.client;
  var index = path.resolve(root, 'index.html');
  var html = fs.readFileSync(index).toString();

  var router = express.Router({
    strict: true,
    mergeParams: false,
    caseSensitive: true
  });

  if (factory.isString(env.config.app.api)) {
    var api = require(env.config.app.api);
    if (factory.isFunction(api)) {
      api(router, db, env);
    } else {
      throw new Error('api module must export a function');
    }
  } else {
    throw new Error('api config must be a filename string');
  }

  var app = express();
  app.use('/api', router);
  app.use(express.static(root, { index: false }));
  app.use(function (request, response) {
    response.set('Content-Type', 'text/html');
    response.send(html);
  });

  return app;
};

// - -------------------------------------------------------------------- - //
