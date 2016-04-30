// - -------------------------------------------------------------------- - //

'use strict';

const express = require('express');
const factory = require('bauer-factory');

module.exports = function (db, env) {
  const router = express.Router({
    strict: true,
    mergeParams: false,
    caseSensitive: true
  });
  const api = env.getServerApi();
  api(router, db, env);
  return router;
};

// - -------------------------------------------------------------------- - //
