(function() {
  "use strict";
  const TAG = "blitz.logger";

  var logLevels = new blitz.utils.Enum(["NONE", "ERROR", "INFO", "VERBOSE", "DEBUG"], 1);

  var activeLevel = logLevels.INFO;
  let groups = [];

  function log(level, tag, message) {
    if (level <= activeLevel) {
      let print = "";

      if (typeof message === "object")
        message = JSON.stringify(message);

      if (groups.length)
        print = `${Array(groups.length).join('  ')}${groups.join(': ')}: `;

      print += `[${logLevels[level]}][${tag}] ${message}`;

      kony.print(print);
    }
  }

  function group(title) {
    groups.push(title || "");
  }

  function groupEnd() {
    groups.pop();
  }

  blitz.logger = {
    levels: logLevels,
    setActiveLevel: function(level) {
      if (level > 0 && level <= logLevels.length) {
        activeLevel = level;
        this.info(TAG, `Log level set to ${logLevels[activeLevel]}`);
      }
    },

    group: group,
    groupEnd: groupEnd,

    error: function(tag, error) {
      if (error instanceof Error)
        log(logLevels.ERROR, tag, error.message + "\n" + error.stack);
      else
        log(logLevels.ERROR, tag, error);
    },
    info: function(tag, message) {
      log(logLevels.INFO, tag, message);
    },
    verbose: function(tag, message) {
      log(logLevels.VERBOSE, tag, message);
    },
    debug: function(tag, message) {
      log(logLevels.DEBUG, tag, message);
    }
  };
}());
