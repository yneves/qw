// - -------------------------------------------------------------------- - //

'use strict';

var assert = require('assert');
var Config = require('../lib/config.js');

// - -------------------------------------------------------------------- - //

describe('qw', () => {

  it('list all environments', () => {
    var config = new Config(__dirname + '/config');
    var envs = config.getAllEnvs();
    assert.deepEqual(envs, [
      'development',
      'staging',
      'testing'
    ]);
  });

});

// - -------------------------------------------------------------------- - //
