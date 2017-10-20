(function() {
  var Bintray, Rest, common, data, fs, request, sendFile, _;

  _ = require("lodash");

  Rest = require("./rest");

  common = require("./common");

  sendFile = require("restler").file;

  data = require("restler").data;

  fs = require("fs");

  request = require("request-promise-native");

  module.exports = Bintray = (function() {
    Bintray.apiBaseUrl = "https://api.bintray.com";

    Bintray.downloadsHost = "http://dl.bintray.com";

    Bintray.apiVersion = "1.0";

    Bintray.prototype.config = {
      debug: false,
      baseUrl: Bintray.apiBaseUrl
    };

    function Bintray(options) {
      var _ref;
      if (options == null) {
        options = {};
      }
      this.rest = new Rest(_.extend(this.config, _.assign(options, {
        password: options.apikey
      })));
      _ref = this.config, this.organization = _ref.organization, this.repository = _ref.repository;
      this.endpointBase = (this.organization != null) && (this.repository != null) ? "" + this.organization + "/" + this.repository : "";
    }

    Bintray.prototype.setEndpointBase = function() {
      return this.endpointBase = "" + this.organization + "/" + this.repository;
    };

    Bintray.prototype.selectRepository = function(repository) {
      this.repository = repository;
      return this.setEndpointBase();
    };

    Bintray.prototype.selectOrganization = function(organization) {
      this.organization = organization;
      return this.setEndpointBase();
    };

    Bintray.prototype.getRepositories = function() {
      var endpoint;
      endpoint = "/repos/" + this.organization;
      return this.rest.get(endpoint);
    };

    Bintray.prototype.getRepository = function() {
      var endpoint;
      endpoint = "/repos/" + this.endpointBase;
      return this.rest.get(endpoint);
    };

    Bintray.prototype.getPackages = function(start, startName) {
      var endpoint;
      if (start == null) {
        start = 0;
      }
      endpoint = ("/repos/" + this.endpointBase + "/packages?start_pos=" + start) + (startName ? "&start_name=" + startName : "");
      return this.rest.get(endpoint);
    };

    Bintray.prototype.getPackage = function(name) {
      var endpoint;
      endpoint = "/packages/" + this.endpointBase + "/" + name;
      return this.rest.get(endpoint);
    };

    Bintray.prototype.createPackage = function(packageObj) {
      var endpoint;
      endpoint = "/packages/" + this.endpointBase;
      return this.rest.post(endpoint, {
        data: JSON.stringify(packageObj)
      });
    };

    Bintray.prototype.deletePackage = function(name) {
      var endpoint;
      endpoint = "/packages/" + this.endpointBase + "/" + name;
      return this.rest.del(endpoint);
    };

    Bintray.prototype.updatePackage = function(name, packageObj) {
      var endpoint;
      endpoint = "/packages/" + this.endpointBase + "/" + name;
      return this.rest.patch(endpoint, {
        data: JSON.stringify(packageObj)
      });
    };

    Bintray.prototype.getPackageVersion = function(name, version) {
      var endpoint;
      if (version == null) {
        version = "_latest";
      }
      endpoint = "/packages/" + this.endpointBase + "/" + name + "/versions/" + version;
      return this.rest.get(endpoint);
    };

    Bintray.prototype.getPackageUrl = function(pkgname, repository) {
      var deferred;
      deferred = Rest.defer();
      this.searchFile(pkgname, repository).then(function(response) {
        var notFound;
        notFound = function() {
          response.code = 404;
          response.status = 'Not Found';
          return response;
        };
        data = response.data;
        if (response !== 200 || _.isEmpty(data)) {
          return deferred.reject(notFound());
        } else {
          if (_.isArray(data)) {
            data = data[0];
            if (data) {
              response.data = {
                url: "" + Bintray.downloadsHost + "/" + data.owner + "/" + data.repo + "/" + data.path
              };
              return deferred.resolve(response);
            } else {
              return deferred.reject(notFound());
            }
          } else {
            return deferred.reject(notFound());
          }
        }
      }, function(error) {
        return deferred.reject(error);
      });
      return deferred.promise;
    };

    Bintray.prototype.createPackageVersion = function(name, versionObj) {
      var endpoint;
      endpoint = "/packages/" + this.endpointBase + "/" + name + "/versions";
      return this.rest.post(endpoint, {
        data: JSON.stringify(versionObj)
      });
    };

    Bintray.prototype.deletePackageVersion = function(name, version) {
      var endpoint;
      endpoint = "/packages/" + this.endpointBase + "/" + name + "/versions/" + version;
      return this.rest.del(endpoint);
    };

    Bintray.prototype.updatePackageVersion = function(name, version, versionObj) {
      var endpoint;
      endpoint = "/packages/" + this.endpointBase + "/" + name + "/versions/" + version;
      return this.rest.post(endpoint, {
        data: JSON.stringify(versionObj)
      });
    };

    Bintray.prototype.getPackageAttrs = function(name, attributes) {
      var endpoint;
      endpoint = "/packages/" + this.endpointBase + "/" + name + "/attributes?names=" + attributes;
      return this.rest.get(endpoint);
    };

    Bintray.prototype.getVersionAttrs = function(name, attributes, version) {
      var endpoint;
      if (version == null) {
        version = '_latest';
      }
      endpoint = "/packages/" + this.endpointBase + "/" + name + "/versions/" + version + "/attributes?names=" + attributes;
      return this.rest.get(endpoint);
    };

    Bintray.prototype.setPackageAttrs = function(name, attributesObj, version) {
      var endpoint;
      endpoint = "/packages/" + this.endpointBase + "/" + name;
      if (version) {
        endpoint += "/versions/" + version + "/attributes";
      } else {
        endpoint += "/attributes";
      }
      return this.rest.post(endpoint, {
        data: JSON.stringify(attributesObj)
      });
    };

    Bintray.prototype.updatePackageAttrs = function(name, attributesObj, version) {
      var endpoint;
      endpoint = "/packages/" + this.endpointBase + "/" + name;
      if (version) {
        endpoint += "/versions/" + version + "/attributes";
      } else {
        endpoint += "/attributes";
      }
      return this.rest.patch(endpoint, {
        data: JSON.stringify(attributesObj)
      });
    };

    Bintray.prototype.deletePackageAttrs = function(name, names, version) {
      var endpoint;
      endpoint = "/packages/" + this.endpointBase + "/" + name;
      if (version) {
        endpoint += "/versions/" + version + "/attributes";
      } else {
        endpoint += "/attributes";
      }
      endpoint += "?names=" + names;
      return this.rest.del(endpoint);
    };

    Bintray.prototype.searchRepository = function(name, description) {
      var endpoint;
      endpoint = "/search/repos?";
      if (name) {
        endpoint += "name=" + name;
      }
      if (description) {
        endpoint += "&desc=" + description;
      }
      return this.rest.get(endpoint);
    };

    Bintray.prototype.searchPackage = function(name, description, organization, repository) {
      var endpoint;
      endpoint = "/search/packages?";
      if (name) {
        endpoint += "name=" + name;
      }
      if (description) {
        endpoint += "&desc=" + description;
      }
      if (organization != null) {
        endpoint += "&organization=" + organization;
      }
      if (repository != null) {
        endpoint += "&repo=" + repository;
      }
      return this.rest.get(endpoint);
    };

    Bintray.prototype.searchUser = function(name) {
      var endpoint;
      endpoint = "/search/users?name=" + name;
      return this.rest.get(endpoint);
    };

    Bintray.prototype.searchAttributes = function(attributesObj, name) {
      var endpoint;
      endpoint = "/search/attributes/" + this.endpointBase;
      if (name) {
        endpoint += "/" + name + "/versions";
      }
      return this.rest.post(endpoint, {
        data: JSON.stringify(attributesObj)
      });
    };

    Bintray.prototype.searchFile = function(name, repository) {
      var endpoint;
      endpoint = "/search/file?name=" + (encodeURIComponent(name));
      if (repository) {
        endpoint += "&repo=" + repository;
      }
      return this.rest.get(endpoint);
    };

    Bintray.prototype.searchFileChecksum = function(hash, repository) {
      var endpoint;
      endpoint = "/search/file?sha1=" + name;
      if (repository) {
        endpoint += "&repo=" + repository;
      }
      return this.rest.get(endpoint);
    };

    Bintray.prototype.getUser = function(username) {
      var endpoint;
      endpoint = "/users/" + username;
      return this.rest.get(endpoint);
    };

    Bintray.prototype.getUserFollowers = function(username, startPosition) {
      var endpoint;
      if (startPosition == null) {
        startPosition = 0;
      }
      endpoint = "/users/" + username + "/followers";
      if (startPosition) {
        endpoint += "?startPosition=" + startPosition;
      }
      return this.rest.get(endpoint);
    };

    Bintray.prototype.uploadPackage = function(name, version, filePath, remotePath, publish, explode, mimeType) {
      var endpoint, readStream;
      if (remotePath == null) {
        remotePath = '/';
      }
      if (publish == null) {
        publish = false;
      }
      if (explode == null) {
        explode = false;
      }
      if (mimeType == null) {
        mimeType = "application/octet-stream";
      }
      endpoint = ("/content/" + this.endpointBase + "/" + name + "/" + version + "/" + remotePath) + (publish ? ";publish=1" : "") + (explode ? ";explode=1" : "");
      readStream = fs.createReadStream(filePath);
      return request.put({
        url: Bintray.apiBaseUrl + endpoint,
        body: readStream,
        headers: {
          "Content-Type": mimeType
        },
        auth: {
          user: this.rest.options.username,
          pass: this.rest.options.password
        }
      });
    };

    Bintray.prototype.publishPackage = function(name, version, discard) {
      var endpoint;
      if (discard == null) {
        discard = false;
      }
      endpoint = "/content/" + this.endpointBase + "/" + name + "/" + version + "/publish";
      return this.rest.post(endpoint, {
        data: JSON.stringify({
          discard: discard
        })
      });
    };

    Bintray.prototype.mavenUpload = function(name, version, filePath, remotePath, publish, explode, mimeType) {
      var endpoint, readStream;
      if (remotePath == null) {
        remotePath = '/';
      }
      if (publish == null) {
        publish = true;
      }
      if (explode == null) {
        explode = false;
      }
      if (mimeType == null) {
        mimeType = "application/octet-stream";
      }
      endpoint = ("/maven/" + this.endpointBase + "/" + name + "/" + remotePath) + (publish ? ";publish=1" : "") + (explode ? ";explode=1" : "");
      readStream = fs.createReadStream(filePath);
      return request.put({
        url: Bintray.apiBaseUrl + endpoint,
        body: readStream,
        headers: {
          "Content-Type": mimeType
        },
        auth: {
          user: this.rest.options.username,
          pass: this.rest.options.password
        }
      });
    };

    Bintray.prototype.getWebhooks = function(repository) {
      var endpoint;
      if (repository == null) {
        repository = '';
      }
      endpoint = "/webhooks/" + this.organization + "/" + repository;
      return this.rest.get(endpoint);
    };

    Bintray.prototype.createWebhook = function(pkgname, configObj) {
      var endpoint;
      endpoint = "/webhooks/" + this.endpointBase + "/" + pkgname;
      return this.rest.post(endpoint, {
        data: JSON.stringify(config)
      });
    };

    Bintray.prototype.testWebhook = function(pkgname, version, configObj) {
      var endpoint, hmac;
      endpoint = "/webhooks/" + this.endpointBase + "/" + pkgname + "/" + version;
      hmac = require("crypto").createHmac("md5", this.config.password).digest("hex");
      return this.rest.post(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Node.js Bintray client',
          'X-Bintray-WebHook-Hmac': hmac
        },
        data: JSON.stringify(configOBj)
      });
    };

    Bintray.prototype.deleteWebhook = function(pkgname) {
      var endpoint;
      endpoint = "/webhooks/" + this.endpointBase + "/" + pkgname;
      return this.rest.del(endpoint);
    };

    Bintray.prototype.singFile = function(remotePath, passphrase) {
      var endpoint;
      endpoint = ("/gpg/@{@endpointBase}/" + remotePath) + (passphrase ? "?passphrase=" + passphrase : "");
      return this.rest.post(endpoint);
    };

    Bintray.prototype.singVersion = function(pkgname, version, passphrase) {
      var endpoint;
      endpoint = ("/gpg/@{@endpointBase}/" + pkgname + "/versions/" + version) + (passphrase ? "?passphrase=" + passphrase : "");
      return this.rest.post(endpoint);
    };

    Bintray.prototype.getRateLimit = function() {
      return this.rest.rateLimit;
    };

    Bintray.prototype.getRateLimitRemaining = function() {
      return this.rest.rateRemaining;
    };

    return Bintray;

  })();

}).call(this);
