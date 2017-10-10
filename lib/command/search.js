(function() {
  var Bintray, auth, die, error, log, printObj, program, readFile, _ref;

  program = require('commander');

  Bintray = require('../bintray');

  auth = require('../auth');

  _ref = require('../common'), readFile = _ref.readFile, printObj = _ref.printObj, log = _ref.log, die = _ref.die, error = _ref.error;

  program.command('search <type> <query>').description('\n  Search packages, repositories, files, users or attributes'.cyan).usage('<package|user|attribute|repository|file> <query> [options]?').option('-d, --desc', 'Descendent search results'.cyan).option('-o, --organization <name>', '\n    [packages|attributes] Search only packages for the given organization'.cyan).option('-r, --repository <name>', '\n    [packages|attributes] Search only packages for the given repository (requires -o param)'.cyan).option('-f, --filter <value>', '\n    [attributes] Attribute filter rule string or JSON file path with filters'.cyan).option('-p, --pkgname <package>', '\n    [attributes] Search attributes on a specific package'.cyan).option('-c, --checksum', '\n    Query search like MD5 file checksum'.cyan).option('-u, --username <username>', '\n    Defines the authentication username'.cyan).option('-k, --apikey <apikey>', '\n    Defines the authentication API key'.cyan).option('-r, --raw', '\n    Outputs the raw response (JSON)'.cyan).option('-d, --debug', '\n    Enables the verbose/debug output mode'.cyan).on('--help', function() {
    return log("Usage examples:\n\n$ bintray search user john\n$ bintray search package node.js -o myOrganization\n$ bintray search repository reponame\n$ bintray search attribute os -f 'linux'\n$ bintray search file packageName -h 'linux'\n$ bintray search file d8578edf8458ce06fbc5bb76a58c5ca4 --checksum");
  }).action(function(type, query, options) {
    var apikey, client, responseFn, username, _ref1;
    if (!auth.exists() && (options.username == null) && (options.apikey == null)) {
      log("Authentication credentials required. Type --help for more information".red);
      die(1);
    }
    _ref1 = (options.username != null) && (options.apikey != null) ? options : auth.get(), username = _ref1.username, apikey = _ref1.apikey;
    client = new Bintray({
      username: username,
      apikey: apikey,
      organization: options.organization,
      repository: options.repository,
      debug: options.debug
    });
    switch (type) {
      case 'package':
        return client.searchPackage(query, options.desc).then(function(response) {
          var data;
          data = response.data;
          if (options.raw) {
            return log(JSON.stringify(data));
          } else {
            if (!data.length) {
              return log("Package not found!");
            } else {
              return data.forEach(function(pkg) {
                return log(pkg.name.white, "(" + pkg.latest_version + ") [" + pkg.repo + ", " + pkg.owner + "] " + pkg.desc.green);
              });
            }
          }
        }, error);
      case 'repository':
        return client.searchRepositories(query, options.desc).then(function(response) {
          var data;
          data = response.data;
          if (!data.length) {
            return log("Repository not found!");
          } else {
            if (options.raw) {
              return log(JSON.stringify(data));
            } else {
              return data.forEach(function(repo) {
                return log(repo.name.white, "(" + repo.package_count + " packages) [" + repo.owner + "] " + repo.desc.green + " (" + (repo.labels.join(', ')) + ")");
              });
            }
          }
        }, error);
      case 'user':
        return client.searchUser(query).then(function(response) {
          var data;
          data = response.data;
          if (!data.length) {
            return log("User not found!");
          } else {
            if (options.raw) {
              return log(JSON.stringify(data));
            } else {
              return data.forEach(function(user) {
                return log(repo.name.white, "(" + (Math.round(user.quota_used_bytes / 1024 / 1024)) + " MB) [" + (user.organizations.join(', ')) + "] [" + (user.repos.join(', ') || 'No repositories') + "] (" + user.followers_count + " followers)");
              });
            }
          }
        }, error);
      case 'attribute':
        if (query.indexOf('/') !== -1) {
          query = readFile(process.pwd() + query);
        } else if (options.filter) {
          query = [
            {
              query: options.filter
            }
          ];
        } else {
          log("Missing attributes filters. Type --help for more information".red);
          die(1);
        }
        return client.searchAttributes(query, options.pkgname).then(function(response) {
          var data;
          data = response.data;
          if (options.raw) {
            return log(JSON.stringify(data));
          } else {
            if (!data.length) {
              return log("Packages not found!");
            } else {
              return data.forEach(function(pkg) {
                return log(pkg.name.white, "(" + pkg.latest_version + ") [" + pkg.repo + ", " + pkg.owner + "] " + pkg.desc.green);
              });
            }
          }
        }, error);
      case 'file':
        responseFn = function(response) {
          var data;
          data = response.data;
          if (options.raw) {
            return log(JSON.stringify(data));
          } else {
            if (!data) {
              return log("Packages not found!");
            } else {
              return data.forEach(printObj);
            }
          }
        };
        if (options.checksum) {
          return client.searchFileChecksum(query, options.repository).then(responseFn, error);
        } else {
          return client.searchFile(query, options.repository).then(responseFn, error);
        }
        break;
      default:
        log("Invalid search mode. Type --help for more information".red);
        return die(1);
    }
  });

}).call(this);
