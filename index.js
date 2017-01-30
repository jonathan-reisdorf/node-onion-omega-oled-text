module.exports = (function() {
  'use strict';

  const omegaOled = require('onion-omega-oled');

  const chars   = require('./lib/chars');

  const charSize = 16;
  const bitSize  = 8;

  const displayWidth  = 128;
  const displayHeight = 64;

  const cols = displayWidth / charSize;
  const rows = displayHeight / charSize;
  const totalChars = cols * rows;

  class OmegaOledText {
    constructor() {
      this._cache = {};
    }

    /**
     * get matrix for both halves of a given character
     * @param char
     * @returns {*[]}
     */
    _getCharMatrices(char) {
      if (!char) {
        return false;
      }

      if (this._cache[char]) {
        return this._cache[char];
      }

      if (!chars[char]) {
        return this._getCharMatrices(' ');
      }

      const result = [
        chars[char].slice(0, chars[char].length / 2),
        chars[char].slice(chars[char].length / 2)
      ];

      this._cache[char] = result;

      return result;
    }

    init() {
      return omegaOled.init();
    }

    writeText(text, reset) {
      if (typeof reset === 'undefined') {
        reset = true;
      }

      text = String(text).split('\n').map((part, i, arr) => i < arr.length - 1 ? part + ' '.repeat(cols - (part.length % cols)) : part).join('').split('');

      const previousChainModeSetting = omegaOled.chainMode();
      omegaOled.chainMode(true);

      if (reset) {
        omegaOled.cursorPixel(0, 0);

        let fillCharacters = totalChars - text.length;
        text = text.concat(Array.from(Array(fillCharacters < 0 ? 0 : fillCharacters).keys()).map(() => ' '));
      }

      let matricesArray;
      for (let row = 0; row < Math.ceil(text.length / cols); row++) {
        matricesArray = Array.from(Array(cols).keys())
          .map(i => text[(row * cols) + i])
          .map(char => char ? char : ' ')
          .map(char => this._getCharMatrices(char));

        for (let part = 0; part < charSize / bitSize; part++) {
          matricesArray
            .map(matrices => matrices[part]
              .forEach(byte => omegaOled.writeByte(byte))
          );
        }
      }

      const executionResult = omegaOled.executeChain();
      omegaOled.chainMode(previousChainModeSetting);

      return executionResult;
    }
  }

  return new OmegaOledText();
})();
