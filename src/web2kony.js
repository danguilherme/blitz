/**
 * Translating web standards to kony:
 *
 * - setTimeout
 * - clearTimeout
 * - console
 */
(function() {
  this.console = {
    log: kony.print,
    error: kony.print,
    debug: kony.print,
    info: kony.print
  };

  this.setTimeout = (function() {
    var id = 0;
    return function(fn, time) {
      var timerId = ++id;
      kony.timer.schedule(String(timerId), fn, time, false);
      return timerId;
    };
  }());

  this.clearTimeout = function(timeoutId) {
    try {
      kony.timer.cancel(String(timeoutId));
    } catch (e) {
      // iphone throws an error if timer does not exist.
      // we just ignore it
    }
  };
}).call(this);
