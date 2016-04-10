// - -------------------------------------------------------------------- - //

'use strict';

var path = require('path');

module.exports = {

  database: {
    seed: path.resolve(__dirname, '../db/seed.js'),
    schema: path.resolve(__dirname, '../db/schema.js')
  },

  app: {
    port: 8899,
    api: path.resolve(__dirname, '../app/api.js'),
    client: path.resolve(__dirname, '../app/client')
  },

  cmd: {

  },

  src: {

    js: [
      'node_modules/rey/dist/rey.js',
      'node_modules/uimmutable/dist/uimmutable.js',
      'node_modules/moment/moment.js',
      'node_modules/moment/locale/pt-br.js',
      'node_modules/chart.js/Chart.js',
      'node_modules/chart-stackedbar-js/src/Chart.StackedBar.js',
      'node_modules/react-chartjs/dist/react-chartjs.js',
      'src/js/**/*.js'
    ],

    jsx: [
      'src/js/**/*.jsx'
    ],

    less: [
      'src/less/index.less'
    ],

    html: [
      'src/index.html'
    ]
  },

  ga: 'UA-43138463-11',

  ssl: {
    key: path.resolve(__dirname, 'default/ssl/server.key'),
    cert: path.resolve(__dirname, 'default/ssl/server.crt'),
    ca: path.resolve(__dirname, 'default/ssl/ca.crt')
  },

  deploy: {
    key: path.resolve(__dirname, '../../id_rsa'),
    pm2: path.resolve(__dirname, 'default/pm2.json'),
    nginx: path.resolve(__dirname, 'default/nginx.conf'),
    dir: '/home/scripts/qw/evad',
    host: '107.170.69.117',
    user: 'root',
    ignore: [
      'data/*.sqlite',
      'client/index.js',
      'client/index.css'
    ]
  }

};

// - -------------------------------------------------------------------- - //
