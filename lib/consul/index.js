const Consul = require('./client');

var clients = [];

// This is used like a singleton elsewhere in the code, not pretty but less
// intrusive than trying to refactor everything.
exports.init = function(consuls) {
  for (var i = 0; i < consuls.length; i++) {
    var c = consuls[i];
    clients.push(new Consul(c.host, c.port, c.token, c.secure));
  }
}

exports.setLastProcessedRef = function(branch, ref, cb) {
  var completed = 0;
  var errs = "";

  for (var i = 0; i < clients.length; i++) {
    clients[i].setLastProcessedRef(branch, ref, function(err) {
      completed++;

      if (err) {
        errs += err + "\n";
      }

      if (completed === clients.length) {
        cb(errs === "" ? null : errs);
      }
    });
  }
}

exports.handleRefChange = function(branch, cb) {
  var completed = 0;
  var errs = "";

  for (var i = 0; i < clients.length; i++) {
    clients[i].handleRefChange(branch, function(err) {
      completed++;

      if (err) {
        errs += err + "\n";
      }

      if (completed === clients.length) {
        cb(errs === "" ? null : errs);
      }
    });
  }
}

exports.set = function(params, cb) {
  var completed = 0;
  var errs = "";

  for (var i = 0; i < clients.length; i++) {
    clients[i].client.kv.set(params, function(err) {
      completed++;

      if (err) {
        errs += err + "\n";
      }

      if (completed === clients.length) {
        cb(errs === "" ? null : errs);
      }
    });
  }
}
