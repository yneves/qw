// - -------------------------------------------------------------------- - //

'use strict';

var path = require('path');

module.exports = {

  database: {},

  app: {
    port: 9999,
    api: path.resolve(__dirname, '../app/api.js'),
    client: path.resolve(__dirname, '../app/client')
  },

  cmd: {},

  src: {
    js: [],
    jsx: [],
    less: [],
    html: []
  },

  ssl: {
    key: path.resolve(__dirname, 'default/ssl/server.key'),
    cert: path.resolve(__dirname, 'default/ssl/server.crt'),
    ca: path.resolve(__dirname, 'default/ssl/ca.crt')
  },

  deploy: {
    pm2: path.resolve(__dirname, 'default/pm2.json'),
    nginx: path.resolve(__dirname, 'default/nginx.conf'),
    dir: '',
    host: '',
    user: '',
    ignore: []
  }

};

// - -------------------------------------------------------------------- - //
