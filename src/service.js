(function(global) {
  const TAG = "blitz.service";

  function clearResultTable(resultTable) {
    // TODO: remove all non-data information (errCode, opstatus, httpStatusCode, etc)
    return resultTable;
  }

  /* SERVICE */
  function service() {
    let instance = {
      call: function invokeKonyService(konyServerUrl, parameters) {
        return new Promise(function(resolve, reject) {
          var serviceId = parameters.serviceID;

          if (service.trigger('beforeservicecall', {
              serviceId: serviceId,
              url: konyServerUrl,
              parameters: parameters
            }) === false)
            return;

          blitz.logger.group(serviceId);
          blitz.logger.info(TAG, "Invoking service");
          blitz.logger.debug(TAG, "Parameters: " + JSON.stringify(parameters));
          blitz.logger.groupEnd();

          kony.net.invokeServiceAsync(
            konyServerUrl,
            parameters,
            function onResponse(status, resultTable) {
              blitz.logger.group(serviceId);
              blitz.logger.debug(TAG, "Response update. Status = " + status);
              blitz.logger.debug(TAG, "Response update. resultTable = " + JSON.stringify(resultTable));
              try {
                if (status === 400 && resultTable.opstatus === 0) {
                  blitz.logger.info(TAG, "Response received with success");
                  blitz.logger.debug(TAG, "Result table = " + JSON.stringify(resultTable));

                  if (successCB)
                    resolve(clearResultTable(resultTable));

                  service.trigger('servicecallsuccess', {
                    status: status,
                    data: resultTable
                  });
                } else if (status === 300 ||
                  (status === 400 && resultTable.opstatus !== 0)) {
                  blitz.logger.error(TAG, "Service call failed");
                  blitz.logger.debug(TAG, "Result table = " + JSON.stringify(resultTable));

                  reject(error, clearResultTable(resultTable));

                  service.trigger('servicecallerror', {
                    status: status,
                    data: resultTable
                  });
                }
              } catch (e) {
                blitz.logger.error(TAG, "Error after receiving response:");
                blitz.logger.error(TAG, e);
              } finally {
                //blitz__.Message.dismissLoading();
              }

              blitz.logger.groupEnd();
            },
            null
          );
        });
      }
    };

    Object.assign(instance, new blitz.EventEmitter());
    return instance;
  }

  blitz.service = service;
}(this));
