(function() {
  var fs;

  fs = require('fs');

  module.exports = (function() {
    function _Class() {}

    _Class.credentials = null;

    _Class.store = ".bintray.json";

    _Class.get = function() {
      if (_Class.exists() && !_Class.credentials) {
        _Class.credentials = JSON.parse(fs.readFileSync(_Class.store));
      }
      return _Class.credentials;
    };

    _Class.save = function(username, apikey) {
      if ((username != null) && (apikey != null)) {
        return fs.writeFileSync(_Class.store, JSON.stringify({
          username: username,
          apikey: apikey
        }, null, 2));
      }
    };

    _Class.exists = function() {
      return fs.existsSync(_Class.store);
    };

    _Class.clean = function() {
      return fs.unlinkSync(_Class.store);
    };

    return _Class;

  }).call(this);

}).call(this);
