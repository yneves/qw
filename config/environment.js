// - -------------------------------------------------------------------- - //

'use strict';

var fs = require('fs');
var path = require('path');
var factory = require('bauer-factory');

// - -------------------------------------------------------------------- - //

var Environment = factory.createClass({

  // new Environment(name String, file String, parent Config) :Environment
  constructor: function (name, file, parent) {
    this.name = name;
    this.dir = parent.dir;
    this.defaults = parent.getDefaultConfig();
    this.isProduction = name.indexOf('production_') === 0;
    if (this.isProduction) {
      this.customer = name.split('_')[1];
    } else {
      this.customer = 'default';
    }
    this.setConfig(file);
  },

  // .setConfig(file String) :void
  setConfig: function (file) {
    this.base = path.dirname(file);
    this.config = factory.extend({}, this.defaults, require(file));
  },

  // .getSchemaFile(name String) :String
  getSchemaFile: function (name) {
    var file;
    if (this.isProduction) {
      file = path.resolve(this.base, 'schemas', name + '.js');
    } else {
      file = path.resolve(this.base, 'ccmhsp', 'schemas', name + '.js');
    }
    return file;
  },

  // .hasSchema(name String) :Boolean
  hasSchema: function (name) {
    return fs.existsSync(this.getSchemaFile(name));
  },

  // .getSchema(name String) :Object
  getSchema: function (name) {
    if (this.hasSchema(name)) {
      var file = this.getSchemaFile(name);
      var schema = require(file);
      if (factory.isFunction(schema)) {
        schema = schema(this);
      }
      return schema;
    }
  },

  getSSLParams: function () {
    var params = {
      key: fs.readFileSync(this.config.ssl.key),
      cert: fs.readFileSync(this.config.ssl.cert)
    };
    if (this.config.ssl.ca) {
      params.ca = fs.readFileSync(this.config.ssl.ca);
      params.requestCert = true;
      params.rejectUnauthorized = false;
    }
    return params;
  }

});

// - -------------------------------------------------------------------- - //

module.exports = Environment;

// - -------------------------------------------------------------------- - //
