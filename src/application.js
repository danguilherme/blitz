/**
 * Depends on:
 * 	- core
 */
(function(global) {
  const TAG = "blitz.application";
  /**
   * @return {Application} a new application instance
   * @module application
   */
  blitz.application = (function() {
    var instance = {};

    Object.assign(instance, new blitz.EventEmitter());
    instance.broadcast = instance.trigger;

    instance.preInit = function() {
      instance.trigger('preinit');
    };
    instance.init = function() {
      instance.trigger('init');
    };
    instance.postInit = function() {
      instance.trigger('postinit');
    };

    // listen to kony application lifecyle events
    // http://docs.kony.com/konylibrary/studio/kony_studio_api_reference_guide/Default.htm#application_events.htm#setappli%3FTocPath%3DApplication%2520APIs%7C_____4
    kony.application.setApplicationCallbacks({
      onbackground: function() {
        blitz.logger.debug(TAG, "onbackground");
        instance.broadcast("background");
      },
      onforeground: function() {
        blitz.logger.debug(TAG, "onforeground");
        instance.broadcast("foreground");
      },
      onlowmemory: function() {
        blitz.logger.debug(TAG, "onlowmemory");
        instance.broadcast("lowmemory");
      }
    });

    instance.getCurrentForm = function getCurrentForm() {
      var currentForm = kony.application.getCurrentForm();
      // getCurrentForm on iOS returns the form ID, per the documentation
      if (typeof currentForm === 'string')
        currentForm = global[currentForm];
      return currentForm;
    };

    return instance;
  }());
}(this));
