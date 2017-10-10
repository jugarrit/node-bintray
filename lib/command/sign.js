(function() {
  var Bintray, auth, die, error, log, program, _ref;

  program = require('commander');

  Bintray = require('../bintray');

  auth = require('../auth');

  _ref = require('../common'), die = _ref.die, log = _ref.log, error = _ref.error;

  program.command('sign <organization> <repository> <pkgname> <passphrase>').description('\n  Sign files and packages versions with GPG. Authentication required'.cyan).usage('<organization> <repository> <pkgname> <passphrase>').option('-n, --version <version>', 'Defines a specific package version'.cyan).option('-u, --username <username>', 'Defines the authentication username'.cyan).option('-k, --apikey <apikey>', 'Defines the authentication API key'.cyan).option('-r, --raw', 'Outputs the raw response (JSON)'.cyan).option('-d, --debug', 'Enables the verbose/debug output mode'.cyan).on('--help', function() {
    return log("Usage examples:\n\n$ bintray sign myorganization myrepository mypackage mypassphrasevalue -n 0.1.0\n$ bintray sign myorganization myrepository /my/file/path.tag.gz mypassphrasevalue\n");
  }).action(function(organization, repository, pkgname, passphrase, options) {
    var apikey, client, username, _ref1;
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
    if (pgkname.indexOf('/' !== -1)) {
      return client.singFile(pkgname, passphrase).then(function(response) {
        var data;
        data = response.data;
        if (options.raw) {
          return log(JSON.stringify(data));
        } else {
          if (response.code !== 200) {
            return error(response);
          } else {
            return log("File signed successfully".green);
          }
        }
      }, error);
    } else {
      if (!options.version) {
        log("Version param required. Type --help for more information".red);
        die(1);
      }
      return client.singVersion(pkgname, op).then(function(response) {
        var data;
        data = response.data;
        if (options.raw) {
          return log(JSON.stringify(data));
        } else {
          if (response.code !== 200) {
            return error(response);
          } else {
            return log("File signed successfully".green);
          }
        }
      }, error);
    }
  });

}).call(this);
