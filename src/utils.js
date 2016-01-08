(function() {
  function Enum(items, startingValue) {
    var count = startingValue || 0,
      item;

    this.length = 0;

    for (var i = 0; i < items.length && (item = items[i]); i++) {
      var splitted = item.split(':');
      if (splitted.length == 2) {
        count = Number(splitted[0]);
        item = splitted[1];
      }
      this[this[item] = count++] = item;
      this.length++;
    }
  }

  /**
   * Alters a function without modifying its original contents
   *
   * @source http://blakeembrey.com/articles/2014/01/wrapping-javascript-functions/
   * @example
   *     function add(a, b) {
   *       return a + b;
   *     }
   *     add(3, 7);
   *     //> 10
   *
   *     // modify add so it log and then add.
   *     add = wrap(add, function(originalFn, a, b) {
   *       console.log(a + " + " + b " = " + originalFn(a, b));
   *       return originalFn(a, b);
   *     });
   *     add(3, 7);
   *     //> "3 + 7 = 10"
   *     //> 10
   */
  function wrap(fn, wrap) {
    return function() {
      return wrap.apply(this, [fn].concat(Array.prototype.slice.call(arguments)));
    };
  };

  function argumentsToArray(args) {
    return Array.prototype.slice.call(args);
  }

  blitz.utils = {
    Enum: Enum,

    wrap: wrap,
    args2array: argumentsToArray
  };
}());
