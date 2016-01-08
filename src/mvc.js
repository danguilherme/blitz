(function(global) {
  const TAG = "blitz_mvc";

  var mvc = {
    modules: {}
  };

  trmb.logger.verbose(TAG, "[LOADING]");

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
    var viewbag = new ViewBag();

    config = extend({}, {
      statusBarColorCode: '#000000',

      // default, overridable properties
      init: function() {},

      /**
       * overwrites native Return button
       */
      navigateBack: function() {}
    }, config);

    var instance = {
      moduleName: moduleName,
      formId: formId,
      form: function form() {
        return global[instance.formId];
      },
      navigateBack: function() {
        // var mForm;
        // var visibleForm;
        //
        // if (global.trmb.View.formHistory.length <= 1)
        //   kony.application.exit();
        // else {
        //   visibleForm = global.trmb.View.formHistory.pop();
        //   // mark the previously active form to be destroyed
        //   formToBeDestroyed = visibleForm.formId;
        //
        //   mForm = global.trmb.View.formHistory[global.trmb.View.formHistory.length - 1];
        //
        //   global.trmb.application.showForm.apply(trmb.application, [mForm.formId].concat(mForm.args));
        // }
      }
    };
    Object.assign(instance, new blitz.EventEmitter());

    mvc.modules[moduleName] = mvc.modules[moduleName] || {};
    mvc.modules[moduleName].views = mvc.modules[moduleName].views || {};
    mvc.modules[moduleName].views[formId] = instance;

    //////////////////////////////
    // FORM LIFECYCLE CALLBACKS //
    //////////////////////////////
    instance.init = function init() {
      trmb.logger.verbose(TAG, instance.formId + ": init");

      //#ifdef android
      instance.form().onDeviceBack = instance.navigateBack;
      //#endif

      instance.form().preShow = instance.onPreShow.bind(instance);
      instance.form().postShow = instance.onPostShow.bind(instance);
      instance.form().onHide = instance.onHide.bind(instance);
      instance.form().onDestroy = instance.onDestroy.bind(instance);

      if (config.init)
        config.init.call(instance);

      instance.dispatchEvent("ready");
    };

    instance.onPreShow = function onPreShow() {
      blitz.logger.verbose(TAG, instance.formId + ': onPreShow');
      instance.trigger('beforeshow');
    };

    instance.onPostShow = function onPostShow() {
      blitz.logger.verbose(TAG, instance.formId + ': onPostShow');
      instance.trigger('show');
    };

    instance.onHide = function onHide() {
      blitz.logger.verbose(TAG, instance.formId + ': onHide');
      instance.trigger('hide');
    };

    instance.onDestroy = function onDestroy() {
      blitz.logger.verbose(TAG, instance.formId + ': onDestroy');
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
      blitz.logger.info(TAG, instance.formId + `: setting StatusBar color to  ${instance.statusBarColorCode}`);
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

    instance.viewbag = function() {
      return viewbag;
    };
    viewbag.addEventListener("change", () => instance.updateView());

    instance.isActive = function isActive() {
      return blitz.application.getCurrentForm().id === instance.formId;
    };

    return instance;
  };

  //VIEW : PROTOTYPE INSTANCE METHODS
  // View.prototype.onPostShow = function() {
  //   trmb.logger.verbose(TAG, this.formId + ': onPostShow');
  //   this.setStatusBarColor(this.statusBarColorCode);
  //
  //   if (formToBeDestroyed) {
  //     trmb.logger.verbose(TAG, this.formId + ': destroying form "' + formToBeDestroyed + '"');
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
  //   if (global.trmb.View.formHistory.length <= 1)
  //     kony.application.exit();
  //   else {
  //     visibleForm = global.trmb.View.formHistory.pop();
  //     // mark the previously active form to be destroyed
  //     formToBeDestroyed = visibleForm.formId;
  //
  //     mForm = global.trmb.View.formHistory[global.trmb.View.formHistory.length - 1];
  //
  //     global.trmb.application.showForm.apply(trmb.application, [mForm.formId].concat(mForm.args));
  //   }
  // };
  //
  // View.prototype.open = function() {
  //   trmb.logger.verbose(TAG, this.formId + ": Opening form");
  //
  //   var mData = {
  //     formId: this.formId,
  //     args: argumentsToArray(arguments)
  //   };
  //
  //   var formHistory = global.trmb.View.formHistory;
  //
  //   if (formHistory.length !== 0) {
  //     //You are on start at list, don`t add again same screen
  //     if (formHistory[formHistory.length - 1].formId == this.formId)
  //       formHistory.pop();
  //   }
  //
  //   // mark to be destroyed the form that will be hidden (if there's no form marked already)
  //   if (!formToBeDestroyed && trmb.application.getCurrentForm())
  //     formToBeDestroyed = trmb.application.getCurrentForm().id;
  //
  //   formHistory.push(mData);
  //
  //   this.form().show();
  // };
  // View.prototype.form = function() {
  //   return global[this.formId];
  // };
  View.prototype.setLoading = function(isLoading) {
    if (isLoading)
      global.trmb.Message.showLoading();
    else
      global.trmb.Message.dismissLoading();
  };
  extend(View.prototype, new blitz.EventEmitter());

  /**
   * Holds data to be transfered between controllers and views.
   */
  function viewbag() {
    var instance = {};

    /**
     * Add data to ViewBag.
     * @param  {String} key   Data identifier
     * @param  {Object|String|Number} value The data itself
     * @return {ViewBag}       Its instance for chaining.
     */
    instance.set = function(key, value) {
      blitz.logger.info(TAG, "ViewBag add item; " +
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
  }
  extend(ViewBag.prototype, new blitz.EventEmitter());

  /* MODEL */
  mvc.model = function model(moduleName) {
    if (arguments.length === 0)
      throw new Error("Module name is mandatory");

    var instance = {
      store: function(key, value) {
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

    mvc.modules[moduleName] = mvc.modules[moduleName] || {};
    mvc.modules[moduleName].model = instance;

    return instance;
  }

  /* CONTROLLER */
  function Controller(moduleName, config) {
    var me = this;
    var view;

    extend(this, {
      onViewReady: function() {
        trmb.logger.verbose(TAG, moduleName + ': View ready.');
      },
      onBeforeViewShow: function() {
        trmb.logger.verbose(TAG, moduleName + ': Before view show.');
      },
      onViewShow: function() {
        trmb.logger.verbose(TAG, moduleName + ': View show.');
      },
      onViewLeave: function() {
        trmb.logger.verbose(TAG, moduleName + ': View left.');
      }
    }, config);
    this.moduleName = moduleName;
    view = this.view();

    view.addEventListener("ready", me.onViewReady.bind(this));
    view.addEventListener("preShow", me.onBeforeViewShow.bind(this));
    view.addEventListener("show", me.onViewShow.bind(this));
    view.addEventListener("leave", me.onViewLeave.bind(this));
  }
  Controller.prototype.view = function() {
    return trmb.View[this.moduleName];
  };
  Controller.prototype.model = function() {
    return trmb.Model[this.moduleName];
  };

  /* SERVICE */
  function Service() {
    //extend(this, config);
    var servers = trmb.Constants.environment.DEV;
  }

  Service.prototype.callWS = function(konyServer, parameters, successCB, errorCB) {
    var serviceId = parameters.serviceID;
    trmb.logger.info(TAG, "Requesting \"" + serviceId + "\" service");
    trmb.logger.verbose(TAG, serviceId + ": Parameters: " + JSON.stringify(parameters));

    var getErrorMessage = function(resulttable) {
      var errorMessage = resulttable.errmsg || resulttable.faultdetail;
      if (resulttable.opstatus == '1000' || resulttable.opstatus == '1016') {
        trmb.application.broadcast("serverConnectionTimeout", serviceId);
        trmb.logger.error(TAG, serviceID + ': connection to server failed, timeout');
        errorMessage = trmb.Constants.serviceStatus.TIMEOUT;
      }
      return errorMessage;
    };

    var onResponse = function(status, resulttable, successCB, errorCB) {
      trmb.logger.verbose(TAG, serviceId + ": Response update. Status = " + status);
      trmb.logger.verbose(TAG, serviceId + ": Response update. resulttable = " + JSON.stringify(resulttable));
      try {
        if (status === 400 && resulttable.opstatus === 0) {
          // DIEGO - inclui aqui pq se nao impedia o usuario de clicar no ok da
          // modal
          //trmb.Message.dismissLoading();
          trmb.logger.info(TAG, serviceId + ": Received response. Status = " + status);
          trmb.logger.verbose(TAG, serviceId + ": Result table = " + JSON.stringify(resulttable));

          if (successCB)
            successCB(resulttable);
        } else if (status === 300 ||
          (status === 400 && resulttable.opstatus !== 0)) {
          // DIEGO - inclui aqui pq se nao impedia o usuario de clicar no ok da
          // modal
          //trmb.Message.dismissLoading();
          var error = getErrorMessage(resulttable);

          trmb.logger.error(TAG, serviceId + ": Service call failed: " + error);
          trmb.logger.verbose(TAG, serviceId + ": Result table = \n" + JSON.stringify(resulttable));

          errorCB(error, resulttable);
        }
      } catch (e) {
        trmb.logger.error(TAG, serviceId + ": Error after receiving response:");
        trmb.logger.error(TAG, e);
      } finally {
        //trmb.Message.dismissLoading();
      }
    };

    kony.net.invokeServiceAsync(
      konyServer,
      parameters,
      function(status, resulttable) {
        onResponse(status, resulttable, successCB, errorCB);
      },
      null
    );
  };
  extend(Service.prototype, new blitz.EventEmitter());

  // blitz.mvc = {
  //   view: view,
  //   Controller: Controller,
  //   Model: Model,
  //   Service: Service
  // };
  // blitz.mvc.View.formHistory = [];

  blitz.mvc = mvc;

  blitz.logger.verbose(TAG, "[LOADED]");
}(this));
