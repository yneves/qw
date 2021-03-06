// - -------------------------------------------------------------------- - //

'use strict';

const fs = require('fs');
const path = require('path');
const express = require('express');
const api = require('./api.js');
const helmet = require('helmet');

module.exports = function (env) {

  const root = env.getStaticRoot();
  const index = path.resolve(root, 'index.html');
  const html = fs.readFileSync(index).toString();

  const app = express();
  app.set('trust proxy', true);
  app.use(helmet());
  app.use('/api', api(env));
  app.use(express.static(root, { index: false }));
  app.use((req, res) => {
    res.set('Content-Type', 'text/html');
    res.send(html);
  });

  return app;
};

// - -------------------------------------------------------------------- - //
