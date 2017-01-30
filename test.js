var omegaOledText = require('./index');

omegaOledText.init().then(function() {
  omegaOledText.writeText('Hello\nworld!\n\nHuhu');
});

