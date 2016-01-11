(function(global) {
  const TAG = "blitz.mvc";

  var mvc = {
    modules: {}
  };

  function initModule(moduleName) {
    if (mvc.modules[moduleName] === undefined) {
      mvc.modules[moduleName] = {};
      mvc.modules[moduleName].model = undefined;
      mvc.modules[moduleName].view = undefined;
      mvc.modules[moduleName].controller = undefined;
    }
  }

  blitz.logger.verbose(TAG, "[LOADING]");

  var formToBeDestroyed = null;

  /* VIEW */
  /**
   * Class responsible to manage views lifecycle and data handling.
   * @param {string} formId Id of the Kony form this view represents.
   * @param {Object} config Configuration object
   * @config {Function} config.init Startup function used to bind component event listeners
   * @config {Function} config.updateView Template function called when viewbag is modified
   */
  mvc.view = function view(moduleName, formId, config) {
    var viewData = viewbag();

    config = Object.assign({}, {
      statusBarColorCode: '#000000',

      // default, overridable properties
      init: function() {},

      /**
       * overwrites native Return button
       */
      // navigateBack: function() {}
    }, config);

    var instance = {
      moduleName: moduleName,
      formId: formId,
      form: function form() {
        return global[instance.formId];
      },
      // navigateBack: function() {
      // var mForm;
      // var visibleForm;
      //
      // if (global.blitz__.View.formHistory.length <= 1)
      //   kony.application.exit();
      // else {
      //   visibleForm = global.blitz__.View.formHistory.pop();
      //   // mark the previously active form to be destroyed
      //   formToBeDestroyed = visibleForm.formId;
      //
      //   mForm = global.blitz__.View.formHistory[global.blitz__.View.formHistory.length - 1];
      //
      //   global.blitz__.application.showForm.apply(blitz__.application, [mForm.formId].concat(mForm.args));
      // }
      // }
    };
    Object.assign(instance, new blitz.EventEmitter());

    initModule(moduleName);
    mvc.modules[moduleName].view = instance;

    //////////////////////////////
    // FORM LIFECYCLE CALLBACKS //
    //////////////////////////////
    instance.init = function init() {
      blitz.logger.debug(TAG, instance.formId + ": init");

      //#ifdef android
      if (instance.navigateBack)
        instance.form().onDeviceBack = instance.navigateBack;
      //#endif

      instance.form().preShow = instance.onPreShow.bind(instance);
      instance.form().postShow = instance.onPostShow.bind(instance);
      instance.form().onHide = instance.onHide.bind(instance);
      instance.form().onDestroy = instance.onDestroy.bind(instance);

      if (config.init)
        config.init.call(instance);

      instance.trigger("ready");
    };

    instance.onPreShow = function onPreShow() {
      blitz.logger.debug(TAG, instance.formId + ': onPreShow');
      config.onPreShow && config.onPreShow.call(this);
      instance.trigger('beforeshow');
    };

    instance.onPostShow = function onPostShow() {
      blitz.logger.debug(TAG, instance.formId + ': onPostShow');
      config.onPostShow && config.onPostShow.call(this);
      instance.trigger('show');
    };

    instance.onHide = function onHide() {
      blitz.logger.debug(TAG, instance.formId + ': onHide');
      config.onHide && config.onHide.call(this);
      instance.trigger('hide');
    };

    instance.onDestroy = function onDestroy() {
      blitz.logger.debug(TAG, instance.formId + ': onDestroy');
      config.onDestroy && config.onDestroy.call(this);
      instance.trigger('destroy');
    };

    instance.open = function open() {
      instance.form().show();
    };

    instance.openForm = function openForm(formId) {
      var view = mvc.modules[moduleName].views[formId];
      // if (!view)
      //   throw new Error(`Form with ID ${formId} does not exist`);
      view.open.apply(view, blitz.utils.args2array(arguments).splice(1));
    };

    instance.setStatusBarColor = function(colorCode) {
      instance.statusBarColorCode = colorCode || instance.statusBarColorCode;
      blitz.logger.info(TAG, `${instance.formId}: setting StatusBar color to  ${instance.statusBarColorCode}`);
      //#ifdef android
      if (kony.os.deviceInfo().version.substr(0, 1) >= 5)
        StatusBar.setColor(instance.statusBarColorCode);
      //#endif
      //#ifdef iphone
      blitz.animation.animate(instance.form(), {
        duration: 0.00000001,
        steps: {
          100: {
            backgroundColor: instance.statusBarColorCode
          }
        }
      });
      //#endif
    };

    instance.data = function(key, value) {
      if (arguments.length === 1)
        return viewData.get(key);
      else
        return viewData.set(key, value);
    };
    viewData.on("change", () => instance.updateView());

    instance.isActive = function isActive() {
      return blitz.application.getCurrentForm().id === instance.formId;
    };

    return instance;
  };

  //VIEW : PROTOTYPE INSTANCE METHODS
  // View.prototype.onPostShow = function() {
  //   blitz__.logger.verbose(TAG, this.formId + ': onPostShow');
  //   this.setStatusBarColor(this.statusBarColorCode);
  //
  //   if (formToBeDestroyed) {
  //     blitz__.logger.verbose(TAG, this.formId + ': destroying form "' + formToBeDestroyed + '"');
  //     global[formToBeDestroyed].destroy();
  //     formToBeDestroyed = null;
  //   }
  //
  //   this.dispatchEvent('show');
  // };
  // View.prototype.onDeviceBack = function() {
  //   var mForm;
  //   var visibleForm;
  //
  //   if (global.blitz__.View.formHistory.length <= 1)
  //     kony.application.exit();
  //   else {
  //     visibleForm = global.blitz__.View.formHistory.pop();
  //     // mark the previously active form to be destroyed
  //     formToBeDestroyed = visibleForm.formId;
  //
  //     mForm = global.blitz__.View.formHistory[global.blitz__.View.formHistory.length - 1];
  //
  //     global.blitz__.application.showForm.apply(blitz__.application, [mForm.formId].concat(mForm.args));
  //   }
  // };
  //
  // View.prototype.open = function() {
  //   blitz__.logger.verbose(TAG, this.formId + ": Opening form");
  //
  //   var mData = {
  //     formId: this.formId,
  //     args: argumentsToArray(arguments)
  //   };
  //
  //   var formHistory = global.blitz__.View.formHistory;
  //
  //   if (formHistory.length !== 0) {
  //     //You are on start at list, don`t add again same screen
  //     if (formHistory[formHistory.length - 1].formId == this.formId)
  //       formHistory.pop();
  //   }
  //
  //   // mark to be destroyed the form that will be hidden (if there's no form marked already)
  //   if (!formToBeDestroyed && blitz__.application.getCurrentForm())
  //     formToBeDestroyed = blitz__.application.getCurrentForm().id;
  //
  //   formHistory.push(mData);
  //
  //   this.form().show();
  // };
  // View.prototype.form = function() {
  //   return global[this.formId];
  // };
  // View.prototype.setLoading = function(isLoading) {
  //   if (isLoading)
  //     global.blitz__.Message.showLoading();
  //   else
  //     global.blitz__.Message.dismissLoading();
  // };
  // extend(View.prototype, new blitz.EventEmitter());

  /**
   * Holds data to be transfered between controllers and views.
   */
  function viewbag() {
    var instance = {};
    Object.assign(instance, new blitz.EventEmitter());

    /**
     * Add data to ViewBag.
     * @param  {String} key   Data identifier
     * @param  {Object|String|Number} value The data itself
     * @return {ViewBag}       Its instance for chaining.
     */
    instance.set = function(key, value) {
      blitz.logger.debug(TAG, "ViewBag add item; " +
        key + " = " + (!!value ? JSON.stringify(value) : value));

      instance[key] = value;
      return instance;
    };

    /**
     * Get data from ViewBag.
     * @param  {String} key   Data identifier
     * @return {Object|String|Number}       The data persisted in this key, or `undefined` if key was not set.
     */
    instance.get = function(key) {
      return instance[key];
    };

    /**
     * Remove data from ViewBag.
     * @param  {String} key   Data identifier
     * @return {ViewBag}       Its instance for chaining.
     */
    instance.remove = function(key) {
      delete instance[key];
      return instance;
    };

    instance.notifyChanges = function() {
      instance.trigger("change");
      return instance;
    };

    return instance;
  }

  /* CONTROLLER */
  mvc.controller = function controller(moduleName, config) {
    initModule(moduleName);

    var instance = {
      moduleName: moduleName,
      view: function view() {
        return mvc.modules[moduleName].view;
      },
      model: function model() {
        return mvc.modules[moduleName].model;
      }
    };

    config = Object.assign({}, {
      control: {}
    }, config);

    var view = instance.view();
    for (var evt in config.control) {
      if (config.control.hasOwnProperty(evt) &&
        typeof config.control[evt] == 'function') {
        view.on(evt, config.control[evt]);
      }
    };

    instance.onViewReady.bind(instance);
  };

  /* MODEL */
  mvc.model = function model(moduleName) {
    if (arguments.length === 0)
      throw new Error("Module name is mandatory");

    var instance = {
      set: function(key, value) {
        blitz.logger.verbose(TAG, `${moduleName}: storing value for '${key}'`);
        kony.store.setItem(`${moduleName}.${key}`,
          JSON.stringify(value));
      },
      get: function(key) {
        blitz.logger.verbose(TAG, `${moduleName}: getting value for '${key}'`);
        var value = kony.store.getItem(`${moduleName}.${key}`);
        return value == undefined ? value : JSON.parse(value);
      }
    };

    initModule(moduleName);
    mvc.modules[moduleName].model = instance;

    return instance;
  };

  blitz.mvc = mvc;
}(this));
