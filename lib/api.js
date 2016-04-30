// - -------------------------------------------------------------------- - //

'use strict';

const express = require('express');
const factory = require('bauer-factory');

module.exports = function (env) {
  const router = express.Router({
    strict: true,
    mergeParams: false,
    caseSensitive: true
  });
  const api = env.getServerApi();
  api(router, env);
  return router;
};

// - -------------------------------------------------------------------- - //
