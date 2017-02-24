(function(global) {
  function widget(konyWidget) {
    // let parsers = [];
    // let formatters = [];

    function text(text) {
      if (!arguments.length)
        return konyWidget.text;
      else
        // TODO: check dropdowns
        konyWidget.text = text;
    }

    return {
      text: text
    }
  }

  blitz.widget = widget;
}(this));
