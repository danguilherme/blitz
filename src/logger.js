(function() {
  const TAG = "blitz.logger";

  var logLevels = new blitz.utils.Enum(["NONE", "ERROR", "INFO", "VERBOSE", "DEBUG"], 1);

  var activeLevel = logLevels.INFO;

  function log(level, tag, message) {
    if (level <= activeLevel) {
      if (typeof message === "object")
        message = JSON.stringify(message);

      kony.print("[" + logLevels[level] + "][" + tag + "] " + message);
    }
  }

  blitz.logger = {
    levels: logLevels,
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
    },
    setActiveLevel: function(level) {
      if (level > 0 && level <= logLevels.length) {
        activeLevel = level;
        this.info(TAG, `Log level set to ${logLevels[activeLevel]}`);
      }
    }
  };
}());
