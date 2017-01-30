var omegaOledText = require('./index');

omegaOledText.init().then(function() {
  omegaOledText.writeText('Hello world!');
});
