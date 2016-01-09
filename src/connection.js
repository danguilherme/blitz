(function(global) {
  const TAG = "blitz_service";

  /* SERVICE */
  function Service() {
    //extend(this, config);
    // var servers = blitz__.Constants.environment.DEV;
    servers = "[no server]";
  }

  Service.prototype.call = function(konyServer, parameters) {
    return new Promise(function(resolve, reject) {
      var serviceId = parameters.serviceID;
      blitz.logger.info(TAG, "Requesting \"" + serviceId + "\" service");
      blitz.logger.verbose(TAG, serviceId + ": Parameters: " + JSON.stringify(parameters));

      var getErrorMessage = function(resulttable) {
        var errorMessage = resulttable.errmsg || resulttable.faultdetail;
        if (resulttable.opstatus == '1000' || resulttable.opstatus == '1016') {
          blitz.application.broadcast("serverConnectionTimeout", serviceId);
          blitz.logger.error(TAG, serviceID + ': connection to server failed, timeout');
          // errorMessage = blitz__.Constants.serviceStatus.TIMEOUT;
          errorMessage = "[no message]";
        }
        return errorMessage;
      };

      kony.net.invokeServiceAsync(
        konyServer,
        parameters,
        function onResponse(status, resulttable) {
          blitz.logger.verbose(TAG, serviceId + ": Response update. Status = " + status);
          blitz.logger.verbose(TAG, serviceId + ": Response update. resulttable = " + JSON.stringify(resulttable));
          try {
            if (status === 400 && resulttable.opstatus === 0) {
              // DIEGO - inclui aqui pq se nao impedia o usuario de clicar no ok da
              // modal
              //blitz__.Message.dismissLoading();
              blitz.logger.info(TAG, serviceId + ": Received response. Status = " + status);
              blitz.logger.verbose(TAG, serviceId + ": Result table = " + JSON.stringify(resulttable));

              if (successCB)
                successCB(resulttable);
            } else if (status === 300 ||
              (status === 400 && resulttable.opstatus !== 0)) {
              var error = "[no message]";

              blitz.logger.error(TAG, serviceId + ": Service call failed: " + error);
              blitz.logger.verbose(TAG, serviceId + ": Result table = \n" + JSON.stringify(resulttable));

              reject(error, resulttable);
            }
          } catch (e) {
            blitz.logger.error(TAG, serviceId + ": Error after receiving response:");
            blitz.logger.error(TAG, e);
          } finally {
            //blitz__.Message.dismissLoading();
          }
        },
        null
      );
    });
  };
  // extend(Service.prototype, new blitz.EventEmitter());
}(this));
