(function() {
  var fs, path, _;

  fs = require('fs');

  path = require('path');

  _ = require('lodash');

  module.exports = (function() {
    function _Class() {}

    _Class.getFileSize = function(path) {
      return fs.statSync(path).size;
    };

    _Class.readFile = function(filepath) {
      var data;
      data = fs.readFileSync(path.resolve(path.normalize(filepath)));
      if (/.json$/.test(filepath)) {
        data = JSON.parse(data);
      }
      return data;
    };

    _Class.fileExists = function(filepath) {
      return fs.existsSync(filepath);
    };

    _Class.error = function(error) {
      _Class.log("Error:".red, "cannot get the resource [HTTP " + error.code + " - " + error.status + "]", error.response.req.path.green);
      return _Class.die(1);
    };

    _Class.log = function() {
      return console.log.apply(null, Array.prototype.slice.call(arguments));
    };

    _Class.die = function(code) {
      return process.exit(code || 0);
    };

    _Class.printObj = function(obj) {
      var arr, prop, value;
      arr = [];
      for (prop in obj) {
        if (!(obj.hasOwnProperty(prop))) {
          continue;
        }
        value = obj[prop];
        if (value.toString() !== '[object Object]') {
          if (_.isArray(value)) {
            value = value.join(', ');
          }
          arr.push((prop.charAt(0).toUpperCase() + prop.slice(1)).replace('_', ' ') + ': ' + value);
        }
      }
      return console.log(arr.join('\n'));
    };

    return _Class;

  }).call(this);

}).call(this);
