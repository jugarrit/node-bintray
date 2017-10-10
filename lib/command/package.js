(function() {
  var Bintray, auth, die, error, fileExists, log, printObj, program, readFile, _, _ref;

  _ = require('lodash');

  program = require('commander');

  Bintray = require('../bintray');

  auth = require('../auth');

  _ref = require('../common'), fileExists = _ref.fileExists, readFile = _ref.readFile, printObj = _ref.printObj, log = _ref.log, die = _ref.die, error = _ref.error;

  program.command('package <action> <organization> <repository> [pkgname] [pkgfile]').description('\n  Get, update, delete or create packages. Authentication required'.cyan).usage(' <list|info|create|delete|update|url> <organization> <repository> [pkgname] [pkgfile]?').option('-s, --start-pos [number]', '[list] Packages list start position'.cyan).option('-n, --start-name [prefix]', '[list] Packages start name prefix filter'.cyan).option('-t, --description <description>', '[create|update] Package description'.cyan).option('-l, --labels <labels>', '[create|update] Package labels comma separated'.cyan).option('-x, --licenses <licenses>', '[create|update] Package licenses comma separated'.cyan).option('-z, --norepository', '[url] Get package URL from any repository'.cyan).option('-u, --username <username>', 'Defines the authentication username'.cyan).option('-k, --apikey <apikey>', 'Defines the authentication API key'.cyan).option('-r, --raw', 'Outputs the raw response (JSON)'.cyan).option('-d, --debug', 'Enables the verbose/debug output mode'.cyan).on('--help', function() {
    return log("    Usage examples:\n\n    $ bintray package list myorganization myrepository \n    $ bintray package get myorganization myrepository mypackage\n    $ bintray package create myorganization myrepository mypackage \\\n        --description 'My package' -labels 'package,binary' --license 'MIT,AGPL'\n    $ bintray package delete myorganization myrepository mypackage");
  }).action(function(action, repository, organization, pkgname, pkgfile, options) {
    var actions, apikey, client, e, pkgObj, username, _ref1;
    actions = ['list', 'get', 'create', 'delete', 'update'];
    action = action.toLowerCase();
    if (!organization || !repository) {
      log('"organization and repository command are required. Type --help for more information'.red);
      die(1);
    }
    _ref1 = (options.username != null) && (options.apikey != null) ? options : auth.get(), username = _ref1.username, apikey = _ref1.apikey;
    if ((username != null) && (apikey != null)) {
      client = new Bintray({
        username: username,
        apikey: apikey,
        organization: organization,
        repository: repository,
        debug: options.debug
      });
    } else {
      client = new Bintray({
        debug: options.debug
      });
    }
    if (action !== 'list') {
      if (!pkgname) {
        log('"package" name argument required. Type --help for more information'.red);
        die(1);
      }
    }
    switch (action) {
      case 'list':
        options.startPos = parseInt(options.startPos, 10) || 0;
        return client.getPackages(options.startPos, options.startName).then(function(response) {
          var data;
          data = response.data;
          if (options.raw) {
            return log(JSON.stringify(data));
          } else {
            if (data.length) {
              log(("Available packages at '" + repository + "' repository:").grey);
              return data.forEach(printObj);
            } else {
              return log('Packages not found'.red);
            }
          }
        }, error);
      case 'get':
        return client.getPackage(pkgname).then(function(response) {
          var data;
          data = response.data;
          if (options.raw) {
            return log(JSON.stringify(data));
          } else {
            if ((data != null) && data.name) {
              return log('%s %s [%s/%s] %s', data.name, data.latest_version || '(no version)', data.owner, data.repo, data.desc);
            } else {
              return log('Package not found'.red);
            }
          }
        }, error);
      case 'create':
        if ((options.description != null) && (options.labels != null) && (options.licenses != null)) {
          pkgObj = {
            name: pkgname,
            desc: options.description,
            labels: options.labels.split(','),
            licenses: options.licenses(',')
          };
        } else {
          if (!pkgfile) {
            log('No input file specified, looking for .bintray'.grey);
            pkgfile = '.bintray';
          }
          if (!fileExists(pkgfile)) {
            log('Package manifest JSON file not found.'.red);
            die(1);
          }
        }
        if (!_.isObject(pkgObj)) {
          try {
            pkgObj = JSON.parse(readFile(pkgfile));
          } catch (_error) {
            e = _error;
            log('Error parsing JSON file:', e.message);
            die(1);
          }
        }
        return client.createPackage(pkgObj).then(function(response) {
          if (response.code === 201) {
            return log('Package created successfully'.green);
          }
        }, error);
      case 'delete':
        return client.deletePackage(pkgname).then(function(response) {
          if (response.code === 200) {
            return log('Package deleted successfully'.green);
          }
        }, error);
      case 'update':
        if ((options.description != null) && (options.labels != null) && (options.licenses != null)) {
          pkgObj = {
            name: pkgname,
            desc: options.description,
            labels: options.labels.split(','),
            licenses: options.licenses(',')
          };
        } else {
          if (!pkgfile) {
            log('No input file specified, looking for .bintray'.grey);
            pkgfile = '.bintray';
          }
          if (!fileExists(pkgfile)) {
            log('Package manifest JSON file not found.'.red);
            die(1);
          }
        }
        if (!_.isObject(pkgObj)) {
          try {
            pkgObj = JSON.parse(readFile(pkgfile));
          } catch (_error) {
            e = _error;
            log('Error parsing JSON file:', e.message);
            die(1);
          }
        }
        return client.updatePackage(pkgname, pkgObj).then(function(response) {
          if (response.code === 200) {
            return log('Package updated successfully'.green);
          }
        }, error);
      case 'url':
        if (options.norepository) {
          repository = null;
        }
        return client.getPackageUrl(pkgname, repository).then(function(response) {
          console.log(response.data);
          if (options.raw) {
            return log(JSON.stringify(response.data));
          } else {
            if (response.code !== 200 || !response.data) {
              return log('Package not found'.red);
            } else {
              return log(response.data.url);
            }
          }
        }, error);
      default:
        log(("Invalid '" + action + "' action. Type --help").red);
        return die(1);
    }
  });

}).call(this);
