(function() {
  var Bintray, auth, die, error, log, printObj, program, _ref;

  program = require('commander');

  Bintray = require('../bintray');

  auth = require('../auth');

  _ref = require('../common'), printObj = _ref.printObj, die = _ref.die, log = _ref.log, error = _ref.error;

  program.command('user <username> [action]').description('\n  Get information about a user. Authentication required'.cyan).usage('<username> [action]').option('-u, --username <username>', 'Defines the authentication username'.cyan).option('-k, --apikey <apikey>', 'Defines the authentication API key'.cyan).option('-s, --start-pos [number]', 'Followers list start position'.cyan).option('-r, --raw', 'Outputs the raw response (JSON)'.cyan).option('-d, --debug', 'Enables the verbose/debug output mode'.cyan).on('--help', function() {
    return log("Usage examples:\n\n$ bintray user john\n$ bintray user john followers -s 1\n");
  }).action(function(username, action, options) {
    var apikey, client, _ref1;
    if (!auth.exists() && (options.username == null) && (options.apikey == null)) {
      log("Authentication credentials required. Type --help for more information".red);
      die(1);
    }
    _ref1 = (options.username != null) && (options.apikey != null) ? options : auth.get(), username = _ref1.username, apikey = _ref1.apikey;
    client = new Bintray({
      username: username,
      apikey: apikey,
      debug: options.debug
    });
    if (action) {
      return client.getUserFollowers(username, options.startPos).then(function(response) {
        var data;
        data = response.data;
        if (options.raw) {
          return log(JSON.stringify(data));
        } else {
          if (!data.length) {
            return log("The user has no followers!");
          } else {
            return data.forEach(printObj);
          }
        }
      }, error);
    } else {
      return client.getUser(username).then(function(response) {
        var data;
        data = response.data;
        if (options.raw) {
          return log(JSON.stringify(data));
        } else {
          if (!data) {
            return log("User not found!");
          } else {
            return log(data.name.white, "(" + (Math.round(user.quota_used_bytes / 1024 / 1024)) + " MB) [" + (user.organizations.join(', ')) + "] [" + (user.repos.join(', ') || 'No repositories') + "] (" + user.followers_count + " followers)");
          }
        }
      }, error);
    }
  });

}).call(this);
