var logger = require('./logging.js');

var fs = require('fs');
var os = require('os');

/**
 * Default config variables
 */

global.config_file = null;

/**
 * Parse out flags and override defaults if they are set
 */
for (var i=2; i<process.argv.length; ++i) {
  if(process.argv[i] === '-f' || process.argv[i] === '--config-file') {
    if(i+1 >= process.argv.length) {
      logger.error("No file provided with --config-file option");
      process.exit(7);
    }
    global.config_file = process.argv[i+1];
  }
}

if (!global.config_file) {
  logger.error("Config file required with --config-file");
  process.exit(7);
}

/**
 * Read config from the specified config file.
 */
var config = JSON.parse(fs.readFileSync(global.config_file, {'encoding':'utf8'}));

// Logging configuration is specified in the config object, so initialize our logger
// around that config.
logger.init(config);

require('./consul').init(config.consuls);

var git = require('./git');

if (!config.repos || !config.repos.length > 0) {
  // Fail startup.
  logger.error("No repos found in configuration.  Halting.")
  process.exit(1);
}

if (config.max_sockets) {
  require('http').globalAgent.maxSockets = config.max_sockets
}

// Process command line switches, if any.  Command-line switches override the settings
// loaded from Consul.
for (var i=2; i<process.argv.length; ++i) {
  if (process.argv[i] === '-n' || process.argv[i] === '--no_daemon') config['no_daemon'] = true;
  if (process.argv[i] === '-h' || process.argv[i] === '--halt_on_change') config['halt_on_change'] = true;
  else if (process.argv[i] === '-d' || process.argv[i] === '--local_store') {
    if (i+1 >= process.argv[length]) {
      logger.error("No dir provided with --local_store option");
      process.exit(3);
    }
    config['local_store'] = process.argv[i+1];
    ++i;
  }
}

if (!config.local_store) {
  config.local_store = os.tmpdir();
}

logger.info('git2consul is running');

process.on('uncaughtException', function(err) {
  logger.error("Uncaught exception " + err);
});

// Set up git for each repo
git.createRepos(config, function(err) {
  if (err) {
    logger.error('Failed to create repos due to %s', err);
    setTimeout(function() {
      // If any git manager failed to start, consider this a fatal error.
      process.exit(2);
    }, 2000);
  }
});

