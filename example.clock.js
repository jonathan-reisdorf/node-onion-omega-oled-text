var omegaOledText = require('./index');

var ensureLength = function(value) {
  return '00'.substr( String( value ).length ) + value;
}

var renderTime = function(showColons) {
  var currentTime = new Date();
  var time = [
    ensureLength(currentTime.getHours()),
    ensureLength(currentTime.getMinutes()),
    ensureLength(currentTime.getSeconds())
  ];

  omegaOledText.writeText(time.join(showColons ? ':' : ' ')).then(function() {
    var renderDelay = Date.now() - currentTime.getTime();

    setTimeout(function() {
      renderTime(!showColons);
    }, renderDelay > 500 ? 0 : 500 - renderDelay);
  });
}

omegaOledText.init().then(function() {
  renderTime(true);
});

