const omegaOled = require('onion-omega-oled');

const convert = require('./lib/convert');
const chars   = require('./lib/chars');
const rotate  = require('./lib/rotate');

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

    _ensureLength(arr, length) {
        return [...Array(length).keys()].map(i => arr[arr.length - i - 1] || 0).reverse();
    }

    /**
     * convert byte array to bit matrix
     * @param arr
     * @private
     */
    _toBitMatrix(arr) {
        return arr.map(byte => convert.dec2bin(byte).split('').map(bit => parseInt(bit, 10)))
            .map(bits => this._ensureLength(bits, bitSize))
            .map(bits => bits.map(bit => bit ? 0 : 1));
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

        let _firstHalf  = this._toBitMatrix(chars[char].filter((byte, i) => (i+1) % 2));
        let _secondHalf = this._toBitMatrix(chars[char].filter((byte, i) => i % 2));

        const result = [
            rotate(_firstHalf.slice(0, _firstHalf.length / 2))
                .concat(rotate(_secondHalf.slice(0, _secondHalf.length / 2)))
                .map(bits => this._ensureLength(convert.bin2hex(bits.join('')).split(''), 2).join('')),
            rotate(_firstHalf.slice(_firstHalf.length / 2))
                .concat(rotate(_secondHalf.slice(_secondHalf.length / 2)))
                .map(bits => this._ensureLength(convert.bin2hex(bits.join('')).split(''), 2).join(''))
        ];

        this._cache[char] = result;

        return result;
    }

    init() {
        return omegaOled.init();
    }

    writeText(text, reset = true) {
        text = text.split('');

        const previousChainModeSetting = omegaOled.chainMode();
        omegaOled.chainMode(true);

        if (reset) {
            omegaOled.cursorPixel(0, 0);

            let fillCharacters = totalChars - text.length;
            text = text.concat([...Array(fillCharacters < 0 ? 0 : fillCharacters).keys()].map(() => ' '));
        }

        let matricesArray;
        for (let row = 0; row < Math.ceil(text.length / cols); row++) {
            matricesArray = [...Array(cols).keys()]
                .map(i => text[(row * cols) + i])
                .map(char => char ? char : ' ')
                .map(char => this._getCharMatrices(char));

            for (let part = 0; part < charSize / bitSize; part++) {
                matricesArray
                    .map(matrices => matrices[part]
                    .forEach(byte => omegaOled.writeByte('0x' + byte))
                );
            }
        }

        const executionResult = omegaOled.executeChain();
        omegaOled.chainMode(previousChainModeSetting);

        return executionResult;
    }
}

module.exports = (new OmegaOledText());