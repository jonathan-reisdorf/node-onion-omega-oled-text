module.exports = (function() {
  'use strict';

  const omegaOled = require('onion-omega-oled');

  const chars = require('./lib/chars');

  const charSize = 16;
  const byteSize  = 8;

  const displayWidth  = 128;
  const displayHeight = 64;

  const cols = displayWidth / charSize;
  const rows = displayHeight / charSize;
  const totalChars = cols * rows;

  class OmegaOledText {
    constructor() {
      this._fontCache = {};
      this._renderCache = [];
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

      if (this._fontCache[char]) {
        return this._fontCache[char];
      }

      if (!chars[char]) {
        return this._getCharMatrices(' ');
      }

      const result = [
        chars[char].slice(0, chars[char].length / 2),
        chars[char].slice(chars[char].length / 2)
      ];

      this._fontCache[char] = result;

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
        let newRenderCache = text.concat(Array.from(Array(fillCharacters < 0 ? 0 : fillCharacters).keys()).map(() => ' '));
        text = newRenderCache.map((char, i) => this._renderCache[i] === char ? false : char);
        this._renderCache = newRenderCache;
      } else {
        this._renderCache = [];
      }

      let matricesArray;
      const specialChars = [false];

      for (let row = 0; row < Math.ceil(text.length / cols); row++) {
        matricesArray = Array.from(Array(cols).keys())
          .map(i => text[(row * cols) + i])
          .map(char => char || specialChars.indexOf(char) !== -1 ? char : ' ')
          .map(char => specialChars.indexOf(char) !== -1 ? char : this._getCharMatrices(char));

        for (let part = 0; part < charSize / byteSize; part++) {
          matricesArray
            .map(matrices => matrices ? matrices[part] : matrices)
            .forEach((matrix, i, matrices) => {
              if (matrix) {
                return matrix.forEach(byte => omegaOled.writeByte(byte));
              }

              const nextIsNextRow = i + 1 > cols - 1;

              if (!matrices[i + 1]) {
                if (nextIsNextRow && matricesArray[0][part + 1]) {
                  omegaOled.cursorPixel((row * (charSize / byteSize)) + part + 1, 0);
                }

                return;
              }

              omegaOled.cursorPixel(((row + (nextIsNextRow ? 1 : 0)) * (charSize / byteSize)) + part, nextIsNextRow ? 0 : (i + 1) * charSize);
            });
        }
      }

      const executionResult = omegaOled.executeChain();
      omegaOled.chainMode(previousChainModeSetting);

      return executionResult;
    }
  }

  return new OmegaOledText();
})();
