'use strict';

const npm = require("npm");
const util = require('util');
const EventEmitter = require('events');

function NpmHelper() {
  var me = this;
  // Initialize necessary properties from `EventEmitter` in this instance
  EventEmitter.call(this);

  console.log(EventEmitter)

  this.install = function install(npmPackage, callback) {
    npm.load({}, function(er) {
      if (er) return handlError(er);
      npm.commands.install([npmPackage], function(er, data) {
        if (er) return commandFailed(er)
          // command succeeded, and data might have some info
      });
      npm.registry.log.on("log", function(message) {
        me.emit("log", message);
      });
      npm.on("log", function(message) {
        me.emit("log", message);
      });
    });
  }
}
// Inherit functions from `EventEmitter`'s prototype
util.inherits(NpmHelper, EventEmitter);

module.exports = new NpmHelper;
