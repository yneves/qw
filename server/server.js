// - -------------------------------------------------------------------- - //

'use strict';

var fs = require('fs');
var path = require('path');
var https = require('https');
var app = require('./app.js');
var config = require('../index.js');

var env = config.getEnv(process.argv[2]);

https.createServer(env.getSSLParams(), app(env)).listen(env.config.port, function () {
  process.stdout.write('\n' + env.name + ' server running on port ' + env.config.port + '\n');
});

// - -------------------------------------------------------------------- - //
