(function() {
  var Bintray, auth, die, error, fileExists, log, printObj, program, readFile, _, _ref;

  _ = require('lodash');

  program = require('commander');

  Bintray = require('../bintray');

  auth = require('../auth');

  _ref = require('../common'), readFile = _ref.readFile, fileExists = _ref.fileExists, printObj = _ref.printObj, log = _ref.log, die = _ref.die, error = _ref.error;

  program.command('package-version <action> <organization> <repository> <pkgname> [versionfile]').description('\n  Get, create, delete or update package versions. Authentication required'.cyan).usage('<get|create|delete|update> <organization> <repository> <pkgname>').option('-n, --version <version>', 'Use a specific package version'.cyan).option('-c, --release-notes <notes>', '[create] Add release note comment'.cyan).option('-w, --url <url>', '[create] Add a releases URL notes/changelog'.cyan).option('-t, --date <date>', '\n    [create] Released date in ISO8601 format (optional)'.cyan).option('-f, --file <path>', '\n    [create|update] Path to JSON package version manifest file'.cyan).option('-u, --username <username>', 'Defines the authentication username'.cyan).option('-k, --apikey <apikey>', 'Defines the authentication API key'.cyan).option('-r, --raw', 'Outputs the raw response (JSON)'.cyan).option('-d, --debug', 'Enables the verbose/debug output mode'.cyan).on('--help', function() {
    return log("Usage examples:\n\n$ bintray package-version get myorganization myrepository mypackage\n$ bintray package-version delete myorganization myrepository mypackage -n 0.1.0\n$ bintray package-version create myorganization myrepository mypackage \\\n    -n 0.1.0 -c 'Releases notes...' -w 'https://github.com/myorganization/mypackage/README.md'\n$ bintray package-version update myorganization myrepository mypackage \\\n    -n 0.1.0 -c 'My new releases notes' -w 'https://github.com/myorganization/mypackage/README.md'\n");
  }).action(function(action, organization, repository, pkgname, versionfile, options) {
    var apikey, client, e, username, versionObj, _ref1;
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
    if (action === 'update' || action === 'delete') {
      if (options.version == null) {
        log('"--version" param is required. Type --help for more information'.red);
        die(1);
      }
    }
    switch (action) {
      case 'get':
        return client.getPackageVersion(pkgname, options.version).then(function(response) {
          var data;
          data = response.data;
          if (options.raw) {
            return log(JSON.stringify(data));
          } else {
            if (response.code !== 200) {
              return error(response);
            } else {
              return printObj(data);
            }
          }
        }, error);
      case 'create':
      case 'update':
        if ((options.version != null) && (options.releaseNotes != null) && (options.url != null)) {
          versionObj = {
            name: options.version,
            release_notes: options.releaseNotes,
            release_url: options.url,
            released: options.released || ''
          };
        } else {
          if (!versionfile) {
            log('No input version file specified. Type --help for more information'.grey);
            die(1);
          }
          if (!fileExists(versionfile)) {
            log('Package manifest JSON file not found.'.red);
            die(1);
          }
        }
        if (!_.isObject(versionObj)) {
          try {
            versionObj = JSON.parse(readFile(versionfile));
          } catch (_error) {
            e = _error;
            log('Error parsing JSON file:', e.message);
            die(1);
          }
        }
        if (action === 'update') {
          return client.updatePackageVersion(pkgname, options.version, _.omit(versionObj, 'name')).then(function(response) {
            var data;
            data = response.data;
            if (options.raw) {
              return log(JSON.stringify(data));
            } else {
              if (response.code !== 200) {
                return error(response);
              } else {
                return log("Version updated successfully!".green);
              }
            }
          }, error);
        } else {
          return client.createPackageVersion(pkgname, versionObj).then(function(response) {
            var data;
            data = response.data;
            if (options.raw) {
              return log(JSON.stringify(data));
            } else {
              if (response.code !== 201) {
                return error(response);
              } else {
                return printObj(data);
              }
            }
          }, error);
        }
        break;
      case 'delete':
        return client.deletePackageVersion(pkgname, options.version).then(function(response) {
          var data;
          data = response.data;
          if (options.raw) {
            return log(JSON.stringify(data));
          } else {
            if (response.code !== 200) {
              return error(response);
            } else {
              return log('Package version deleted successfully!'.green);
            }
          }
        }, error);
      default:
        log(("Invalid '" + action + "' action param. Type --help for more information").red);
        return die(1);
    }
  });

}).call(this);
