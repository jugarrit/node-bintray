(function() {
  var Q, Rest, log, promiseResponse, rest, status, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Q = require('q');

  _ = require('lodash');

  rest = require('restler');

  status = require('./status');

  log = require('./common').log;

  promiseResponse = function(response, data) {
    var code;
    code = response.statusCode;
    return {
      code: code,
      status: status[code],
      response: response,
      data: data
    };
  };

  module.exports = Rest = (function() {
    Rest.defer = Q.defer;

    Rest.prototype.baseUrl = null;

    Rest.prototype.rateLimit = 300;

    Rest.prototype.rateRemaining = 300;

    Rest.prototype.options = {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Node.js Bintray client',
        'Content-Length': 0
      }
    };

    function Rest(options) {
      this.wrapResponse = __bind(this.wrapResponse, this);
      this.baseUrl = options.baseUrl;
      this.debug = options.debug || false;
      _.extend(this.options, _.omit(options, 'baseUrl', 'debug', 'apikey'));
    }

    Rest.prototype.getRateLimit = function(response) {
      var headers;
      if (headers = response != null ? response.headers : void 0) {
        if (headers['x-ratelimit-limit']) {
          this.rateLimit = headers['x-ratelimit-limit'];
        }
        if (headers['x-ratelimit-remaining']) {
          this.rateRemaining = headers['x-ratelimit-remaining'];
        }
      }
      return this.rateRemaining;
    };

    Rest.prototype.wrapResponse = function(rest) {
      var deferred,
        _this = this;
      deferred = Q.defer();
      if (this.debug) {
        log(("[" + rest.options.method + "] [" + (rest.options.username || 'NoAuth') + "] " + rest.url.path).grey);
      }
      rest.once('complete', function(result, response) {
        var rateLimit;
        rateLimit = _this.getRateLimit(response);
        if (_this.debug) {
          log(("[" + response.statusCode + "] [" + (rateLimit || 'Unknown') + "] " + response.req.path).green);
        }
        if (rateLimit === 0) {
          response.statusCode = 300;
          deferred.reject(promiseResponse(response, 'You have exceeded your API call limit'));
        } else if (result instanceof Error) {
          deferred.reject(promiseResponse(response, response.raw));
        } else if (response.statusCode >= 300) {
          deferred.reject(promiseResponse(response, result));
        } else {
          deferred.resolve(promiseResponse(response, result));
        }
        return rest.removeAllListeners('error');
      });
      return deferred.promise;
    };

    Rest.prototype.setAuth = function(username, password) {
      return _.extend(this.options, {
        username: username,
        password: password
      });
    };

    Rest.prototype.get = function(path, options) {
      if (options) {
        options = _.extend({}, this.options, options);
      }
      return this.wrapResponse(rest.get(this.baseUrl + path, options || this.options));
    };

    Rest.prototype.post = function(path, options) {
      options = _.extend({}, this.options, options);
      return this.wrapResponse(rest.post(this.baseUrl + path, options));
    };

    Rest.prototype.put = function(path, options) {
      options = _.extend({}, this.options, options);
      return this.wrapResponse(rest.put(this.baseUrl + path, options));
    };

    Rest.prototype.del = function(path, options) {
      options = _.extend({}, this.options, options);
      return this.wrapResponse(rest.del(this.baseUrl + path, options));
    };

    Rest.prototype.head = function(path, options) {
      options = _.extend({}, this.options, options);
      return this.wrapResponse(rest.head(this.baseUrl + path, options));
    };

    Rest.prototype.patch = function(path, options) {
      options = _.extend({}, this.options, options);
      return this.wrapResponse(rest.patch(this.baseUrl + path, options));
    };

    return Rest;

  })();

}).call(this);
