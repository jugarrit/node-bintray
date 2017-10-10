(function() {
  var Bintray, auth, die, error, log, program, _, _ref;

  _ = require('lodash');

  program = require('commander');

  Bintray = require('../bintray');

  auth = require('../auth');

  _ref = require('../common'), die = _ref.die, log = _ref.log, error = _ref.error;

  program.command('webhook <action> <organization> [repository] [pkgname]').description('\n  Manage webhooks. Authentication required'.cyan).usage('<list|create|test|delete> <organization> [respository] [pkgname]').option('-w, --url <url>', '\n    Callback URL. May contain the %r and %p tokens for repo and package name'.cyan).option('-m, --method <method>', '\n    HTTP request method for the callback URL. Defaults to POST'.cyan).option('-n, --version <version>', 'Use a specific package version'.cyan).option('-u, --username <username>', 'Defines the authentication username'.cyan).option('-k, --apikey <apikey>', 'Defines the authentication API key'.cyan).option('-r, --raw', 'Outputs the raw response (JSON)'.cyan).option('-d, --debug', 'Enables the verbose/debug output mode'.cyan).on('--help', function() {
    return log("Usage examples:\n\n$ bintray webhook list myorganization myrepository\n$ bintray webhook create myorganization myrepository mypackage \\ \n    -w 'http://callbacks.myci.org/%r-%p-build' -m 'GET'\n$ bintray webhook test myorganization myrepository mypackage -n '0.1.0'\n$ bintray webhook delete myorganization myrepository mypackage\n");
  }).action(function(action, organization, repository, pkgname, options) {
    var apikey, client, username, _ref1;
    if (!auth.exists() && (options.username == null) && (options.apikey == null)) {
      log("Authentication credentials required. Type --help for more information".red);
      die(1);
    }
    _ref1 = (options.username != null) && (options.apikey != null) ? options : auth.get(), username = _ref1.username, apikey = _ref1.apikey;
    client = new Bintray({
      username: username,
      apikey: apikey,
      organization: organization,
      repository: repository,
      debug: options.debug
    });
    switch (action) {
      case 'list':
        return client.getWebhooks(repository).then(function(response) {
          var data;
          data = response.data;
          if (options.raw) {
            return log(JSON.stringify(data));
          } else {
            if (!data.length) {
              return log("The organization/repository has no webhooks!");
            } else {
              return data.forEach(function(hook) {
                return log(hook['package'].white, "(failure count: " + hook.failure_count + ") [" + hook.url + "]");
              });
            }
          }
        }, error);
      case 'create':
        if (!pkgname) {
          log("Package name param required. Type --help for more information".red);
          die(1);
        }
        if (!repository) {
          log("Repository param required. Type --help for more information".red);
          die(1);
        }
        if (!options.url) {
          log("Url param required. Type --help for more information".red);
          die(1);
        }
        return client.createWebhook(pkgname, _.pick(options, 'url', 'method')).then(function(response) {
          if (options.raw) {
            return log(JSON.stringify(response.code + ' ' + response.status));
          } else {
            if (response.code !== 201) {
              return error(response);
            } else {
              return log(("Webhook created successfully for '" + organization + "/" + repository + "/" + pkgname + "'").green);
            }
          }
        }, error);
      case 'test':
        if (!pkgname) {
          log("Package name param required. Type --help for more information".red);
          die(1);
        }
        if (!repository) {
          log("Repository param required. Type --help for more information".red);
          die(1);
        }
        if (!options.url) {
          log("Url param required. Type --help for more information".red);
          die(1);
        }
        if (!options.version) {
          log("Version param required. Type --help for more information".red);
          die(1);
        }
        return client.testWebhook(pkgname, options.version, _.pick(options, 'url', 'method')).then(function(response) {
          if (options.raw) {
            return log(JSON.stringify(response.code + ' ' + response.status));
          } else {
            if (response.code !== 201) {
              return error(response);
            } else {
              return log(("Webhook created successfully for '" + organization + "/" + repository + "/" + pkgname + "'").green);
            }
          }
        }, error);
      case 'delete':
        if (!pkgname) {
          log("Package name param required. Type --help for more information".red);
          die(1);
        }
        if (!repository) {
          log("Repository param required. Type --help for more information".red);
          die(1);
        }
        return client.deleteWebhook(pkgname).then(function(response) {
          if (options.raw) {
            return log(JSON.stringify(response.code + ' ' + response.status));
          } else {
            if (response.code !== 200) {
              return error(response);
            } else {
              return log(("Webhook deleted successfully for '" + organization + "/" + repository + "/" + pkgname + "'").green);
            }
          }
        }, error);
      default:
        log(("Invalid '" + action + "' action param. Type --help for more information").red);
        return die(1);
    }
  });

}).call(this);
