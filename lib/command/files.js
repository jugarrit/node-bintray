(function() {
  var Bintray, auth, die, error, fileExists, log, program, _ref;

  program = require('commander');

  Bintray = require('../bintray');

  auth = require('../auth');

  _ref = require('../common'), fileExists = _ref.fileExists, die = _ref.die, log = _ref.log, error = _ref.error;

  program.command('files <action> <organization> <repository> <pkgname>').description('\n  Upload or publish packages. Authentication required'.cyan).usage('<upload|publish|maven> <organization> <repository> <pkgname>').option('-n, --version <version>', '\n    [publish|upload] Upload a specific package version'.cyan).option('-e, --explode', 'Explode package'.cyan).option('-h, --publish', 'Publish package'.cyan).option('-x, --discard', '[publish] Discard package'.cyan).option('-f, --local-file <path>', '\n    [upload|maven] Package local path to upload'.cyan).option('-p, --remote-path <path>', '\n    [upload|maven] Repository remote path to upload the package'.cyan).option('-u, --username <username>', 'Defines the authentication username'.cyan).option('-k, --apikey <apikey>', 'Defines the authentication API key'.cyan).option('-r, --raw', 'Outputs the raw response (JSON)'.cyan).option('-d, --debug', 'Enables the verbose/debug output mode'.cyan).on('--help', function() {
    return log("Usage examples:\n\n$ bintray files upload myorganization myrepository mypackage \\ \n    -n 0.1.0 -f files/mypackage-0.1.0.tar.gz -p /files/x86/mypackage/ --publish\n$ bintray files publish myorganization myrepository mypackage -n 0.1.0\n");
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
    if (action === 'upload' || action === 'publish') {
      if (options.version == null) {
        log('"--version" param required. Type --help for more information'.red);
        die(1);
      }
    }
    if (action === 'upload' || action === 'maven') {
      if (!options.localFile) {
        log('"--local-file" param with local path required. Type --help for more information'.grey);
        die(1);
      }
      if (!fileExists(options.localFile)) {
        log('Cannot find the local file "#{options.file}". Try using an absolute path'.red);
        die(1);
      }
      if (!options.remotePath) {
        log('"--remote-path" param with local file path required. Type --help for more information'.grey);
        die(1);
      }
    }
    switch (action) {
      case 'upload':
        log('Uploading file... this may take some minutes...');
        return client.uploadPackage(pkgname, options.version, options.localFile, options.remotePath, options.publish, options.explode).then(function(response) {
          var data;
          data = response.data;
          if (options.raw) {
            return log(JSON.stringify(response.code));
          } else {
            if (response.code !== 201) {
              return error(response);
            } else {
              return log("File uploaded successfully".green);
            }
          }
        }, error);
      case 'publish':
        return client.publishPackage(pkgname, options.version, options.discard).then(function(response) {
          var data;
          data = response.data;
          if (options.raw) {
            return log(JSON.stringify(data));
          } else {
            if (response.code !== 200) {
              return error(response);
            } else {
              if (options.discard) {
                return log(("Files discarted: " + data.files).green);
              } else {
                return log(("Files published: " + data.files).green);
              }
            }
          }
        }, error);
      case 'maven':
        log('Uploading maven packages... this may take some minutes...');
        return client.uploadPackage(pkgname, options.version, options.localFile, options.remotePath, options.publish, options.explode).then(function(response) {
          var data;
          data = response.data;
          if (options.raw) {
            return log(JSON.stringify(response.code));
          } else {
            if (response.code !== 201) {
              return error(response);
            } else {
              return log("File uploaded successfully".green);
            }
          }
        }, error);
      default:
        log(("Invalid '" + action + "' action param. Type --help for more information").red);
        return die(1);
    }
  });

}).call(this);
