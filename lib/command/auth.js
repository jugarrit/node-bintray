(function() {
  var Bintray, auth, common, die, error, log, printObj, program;

  program = require('commander');

  Bintray = require('../bintray');

  auth = require('../auth');

  common = require('../common');

  printObj = common.printObj, log = common.log, die = common.die, error = common.error;

  program.command('auth').description('\n  Defines the Bintray authentication credentials'.cyan).usage('[options]').option('-c, --clean', 'Clean the stored authentication credentials'.cyan).option('-s, --show', 'Show current stored authentication credentials'.cyan).option('-u, --username <username>', 'Bintray username'.cyan).option('-k, --apikey <apikey>', 'User API key'.cyan).on('--help', function() {
    return log("Usage examples:\n\n$ bintray auth -u myuser -k myapikey\n$ bintray auth --show\n");
  }).action(function(options) {
    var authExists, showAuth;
    authExists = auth.exists();
    showAuth = function() {
      return log(printObj(auth.get()));
    };
    if (options.clean) {
      if (authExists) {
        auth.clean();
        return log('Authentication data cleaned'.green);
      } else {
        return log('No authentication credentials defined, nothing to clean'.green);
      }
    } else if (options.show) {
      if (authExists) {
        return showAuth();
      } else {
        return log('No authentication credentials stored'.green);
      }
    } else if (!options.username && !options.apikey) {
      if (authExists) {
        showAuth();
        return log('Type "auth --help" to see more available options');
      } else {
        log('No authentication data defined. Use:');
        return log('$ bintray auth -u myuser -k myapikey'.grey);
      }
    } else {
      if (!options.username || !options.apikey) {
        log('Both username and apikey params are required'.red);
        return die(1);
      } else {
        auth.save(options.username, options.apikey);
        return log('Authentication data saved'.green);
      }
    }
  });

}).call(this);
