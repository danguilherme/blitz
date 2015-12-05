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

  blitz.utils = {
    Enum: Enum
  };
}());
