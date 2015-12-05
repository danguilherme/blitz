/**
 * Depends on:
 * 	- core
 */
(function() {
  /**
   * @return {Application} a new application instance
   * @module application
   */
  blitz.application = function() {
    this.preInit = function() {
      this.trigger('pre-init');
    };
    this.init = function() {
      this.trigger('init');
    };
    this.postInit = function() {
      this.trigger('post-init');
    };
  };
  Object.assign(blitz.application, new blitz.EventEmitter());
}());
