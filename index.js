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
      this._standbyTimeout = 0;
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

    _standbyFunction() {
      return omegaOled.power(false);
    }

    init() {
      return omegaOled.init().then(() => this._renderCache = ' '.repeat(totalChars).split(''));
    }

    setStandbyTimeout(secondsOfInactivity) {
      this._standbyTimeout = secondsOfInactivity || 0;

      if (this._standbyId) {
        clearTimeout(this._standbyId);
      }

      if (secondsOfInactivity) {
        this._standbyId = setTimeout(this._standbyFunction, secondsOfInactivity * 1000);
      }
    }

    addCharacter(character, byteMatrix) {
      if (typeof character !== 'string' || character.length !== 1 || typeof byteMatrix !== 'object' || byteMatrix.length !== charSize * (charSize / byteSize)) {
        return false;
      }

      chars[character] = byteMatrix;
      return true;
    }

    writeText(text, reset) {
      this.setStandbyTimeout(this._standbyTimeout);

      if (typeof reset === 'undefined') {
        reset = true;
      }

      text = String(text).split('\n')
        .map((part, i, arr) => i < arr.length - 1 ? part + ' '.repeat(cols - (part.length % cols)) : part)
        .substr(0, totalChars)
        .join('')
        .split('');

      const previousChainModeSetting = omegaOled.chainMode();
      omegaOled.chainMode(true);

      if (!omegaOled.power()) {
        omegaOled.power(true);
      }

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
      let needsJump = false;

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
                if (needsJump) {
                  omegaOled.cursorPixel((row * (charSize / byteSize)) + part, i * charSize);
                  needsJump = false;
                }

                return matrix.forEach(byte => omegaOled.writeByte(byte));
              }

              needsJump = true;
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
