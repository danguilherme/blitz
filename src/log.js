(function() {
  var logLevels = new blitz.utils.Enum(["NONE", "ERROR", "INFO", "VERBOSE"], 1);

  var activeLevel = logLevels.VERBOSE;

  function log(level, tag, message) {
    if (level <= activeLevel) {
      if (typeof message === "object")
        message = JSON.stringify(message);

      kony.print("[" + logLevels[level] + "][" + tag + "] " + message);
    }
  }

  blitz.log = {
    logLevels: logLevels,
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
    setActiveLevel: function(level) {
      if (level > 0 && level <= logLevels.length)
        activeLevel = level;
    }
  };
}());
