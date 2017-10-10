(function() {
  var Bintray, auth, error, log, program, _ref;

  program = require('commander');

  Bintray = require('../bintray');

  auth = require('../auth');

  _ref = require('../common'), log = _ref.log, error = _ref.error;

  program.command('repositories <organization> [repository]').description('\n  Get information about one or more repositories. Authentication is optional'.cyan).usage('<organization> [repository]').option('-u, --username <username>', 'Defines the authentication username'.cyan).option('-k, --apikey <apikey>', 'Defines the authentication API key'.cyan).option('-r, --raw', 'Outputs the raw response (JSON)'.cyan).option('-d, --debug', 'Enables the verbose/debug output mode'.cyan).on('--help', function() {
    return log("Usage examples:\n\n$ bintray repositories organizationName\n$ bintray repositories organizationName repoName\n");
  }).action(function(organization, repository, options) {
    var apikey, client, username, _ref1;
    _ref1 = (options.username != null) && (options.apikey != null) ? options : auth.get(), username = _ref1.username, apikey = _ref1.apikey;
    if ((username != null) && (apikey != null)) {
      client = new Bintray({
        username: username,
        apikey: apikey,
        organization: organization,
        debug: options.debug
      });
    } else {
      client = new Bintray({
        debug: options.debug
      });
    }
    if (!client.organization) {
      client.selectOrganization(organization);
    }
    if (repository != null) {
      return client.getRepository(repository).then(function(response) {
        var data;
        data = response.data;
        if (options.raw) {
          return log(JSON.stringify(data));
        } else {
          if (!data.length) {
            return log("Repository not found!");
          } else {
            return response.data.forEach(function(repo) {
              return log(repo.name.white, "(" + repo.package_count + " packages) [" + repo.owner + "] " + repo.desc.green + " - " + (repo.labels.join(', ')));
            });
          }
        }
      }, error);
    } else {
      return client.getRepositories().then(function(response) {
        var data;
        data = response.data;
        if (options.raw) {
          return log(JSON.stringify(data));
        } else {
          if (!data) {
            return log("No repositories found!");
          } else {
            return data.forEach(function(repo) {
              return log(repo.name.white, "[" + repo.owner + "]");
            });
          }
        }
      }, error);
    }
  });

}).call(this);
