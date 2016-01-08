(function animation() {
  var widgets = {
    "widgetId": [ /* animation queue */ ]
  };

  function getQueue(widget) {
    return widgets[widget.id] || [];
  }

  function onAnimationEnd(widget, animationHandle, elapsedTime) {
    var queue = getQueue(widget);
    // remove the animation that just run from the queue
    queue.shift();
    // run the next animation
  }

  function runQueue(widget) {
    var queue = getQueue(widget);
    if (queue.length > 1) {
      widget.animate()
    }
  }

  function animate(widget, animationConfig) {
    var queue = getQueue(widget);
    if (queue.length > 1)
      queue.push(config);
  }

  blitz.animation = {
    animate: animate
  };
}());
