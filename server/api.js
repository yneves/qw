// - -------------------------------------------------------------------- - //

'use strict';

var express = require('express');
var factory = require('bauer-factory');

module.exports = function (db, env) {
  var router = express.Router({
    strict: true,
    mergeParams: false,
    caseSensitive: true
  });
  var api = env.requireAPI();
  api(router, db, env);
  return router;
};

// - -------------------------------------------------------------------- - //
