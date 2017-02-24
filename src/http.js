/**
 * kony.net.HttpRequest wrapper module
 * http://docs.kony.com/konyonpremises/default.htm#../Subsystems/API_Reference_Guide/content/network_apis.htm#HttpRequ%3FTocPath%3DKony%2520Studio%7CAPI%2520Reference%2520Guide%7CNetwork%2520APIs%7C_____6
 */
(function() {
  const TAG = "blitz.http";

  /*
    HttpRequest.readyState
      0 - constants.HTTP_READY_STATE_UNSENT
      1 - constants.HTTP_READY_STATE_OPENED
      2 - constants.HTTP_READY_STATE_HEADERS_RECEIVED
      3 - constants.HTTP_READY_STATE_LOADING
      4 - constants.HTTP_READY_STATE_DONE

    HttpRequest.responseType
      constants.HTTP_RESPONSE_TYPE_TEXT
      constants.HTTP_RESPONSE_TYPE_JSON
      constants.HTTP_RESPONSE_TYPE_DOCUMENT
      constants.HTTP_RESPONSE_TYPE_RAWDATA

   */

  var TIMEOUT = 1000 * 60 * 5; // 5 minutes

  function createRequest(method, url) {
    var request = new kony.net.HttpRequest();
    request.open(method, url);

    request.setRequestHeader('User-Agent', `${blitz.application.appName}/${blitz.application.appVersion}`);

    return request;
  }

  function createFormDataFromObject(object) {
    var formData = new kony.net.FormData();

    for (var key in object)
      if (object.hasOwnProperty(key))
        formData.append(key, object[key]);

    return formData;
  }

  /**
   * Creates a function to be used as listener for onReadyStateChange event.
   * @param  {Function} onSuccess Function to execute when request finishes successfully
   * @param  {Function} onFail    Function to execute if the request fails for any reason
   * @return {Function}           Callback function to be assigned to onReadyStateChange event
   */
  function onReadyStateChange(resolve, reject) {
    var request = this;

    return function() {
      var readyState = +request.readyState;
      var status = +request.status;

      blitz.logger.debug(TAG, `Request readyState changed: ${readyState}/${constants.HTTP_READY_STATE_DONE}`);

      if (readyState === constants.HTTP_READY_STATE_DONE) {
        if (status >= 200 && status <= 299) {
          blitz.logger.debug(TAG, `Request successfully performed.`);
          blitz.logger.info(TAG, `HTTP ${status}`);
          resolve(request.response);
        } else {
          blitz.logger.debug(TAG, `Request failed.`);
          blitz.logger.info(TAG, `HTTP ${status}`);
          reject(request);
        }
      }
    }
  }

  function get(url) {
    return new Promise(function(resolve, reject) {
      var request = createRequest(constants.HTTP_METHOD_GET, url);

      request.onReadyStateChange = onReadyStateChange.call(request, resolve, reject);

      blitz.logger.info(TAG, `GET ${url}`);
      request.send();
    });
  }

  function post(url, body) {
    return new Promise(function(resolve, reject) {
      var request = createRequest(constants.HTTP_METHOD_POST, url);

      request.onReadyStateChange = onReadyStateChange.call(request, resolve, reject);

      blitz.logger.info(TAG, `POST ${url}`);
      request.send(!body ? null : createFormDataFromObject(body));
    });
  }

  blitz.http = {
    get: get,
    post: post
      // put: put,
      // delete: delete
  };
}());
