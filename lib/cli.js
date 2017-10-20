(function() {
  var log, pkg, program;

  program = require('commander');

  pkg = require('../package.json');

  log = require('./common').log;

  ['auth', 'package', 'search', 'repositories', 'sign', 'version', 'webhook', 'files', 'user'].map(function(file) {
    return './command/' + file;
  }).forEach(require);

  program.version(pkg.version);

  program.on('--help', function() {
    return log("  Usage Examples:\n\n  $ bintray auth set -u username -k apikey\n  $ bintray search package node.js -o myOrganization\n  $ bintray repositories organizationName\n  $ bintray files publish myorganization myrepository mypackage -n 0.1.0\n");
  });

  module.exports.parse = function(args) {
    return program.parse(args);
  };

}).call(this);
