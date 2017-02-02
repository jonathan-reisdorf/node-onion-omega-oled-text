$(() => {
  const byteSize = 8;
  const charSize = 16;

  let $body = $('body'), $row;
  const $characterSelect = $('#characters');
  const $input = $('#input');

  function renderFromChar(char) {
    if (!chars[char]) {
      return;
    }

    generateFromCode(chars[char].join(', '));
    $input.val('[' + chars[char].map(value => "'" + value + "'").join(', ') + ']');
  }

  function setState($col, state) {
    $col.html(state).data('state', state)[state ? 'addClass' : 'removeClass']('col--active');
  }

  function hex2bin(hex) {
    return parseInt(hex, 16).toString(2);
  }

  function bin2Hex(bin) {
    return parseInt(bin, 2).toString(16);
  }

  function generateCode() {
    const $rows = $body.children('.row');
    let result = [],
      _tmp;

    for (let part = 0; part < charSize / byteSize; part++) {
      for (let x = 0; x < charSize; x++) {
        _tmp = bin2Hex(
          Array.from(Array(byteSize).keys())
            .map(i => $rows.eq((part * byteSize) + i).children('.col').eq(x).data('state'))
            .reverse().join('')
        );
        result.push('0x' + '0'.repeat(2 - _tmp.length) + _tmp);
      }
    }

    $input.val('[' + result.map(value => "'" + value + "'").join(', ') + ']');

    return result;
  }

  function generateFromCode(code) {
    const $rows = $body.children('.row');

    const result = code.split(/,[ ]*/g)
      .map(value => hex2bin(value.replace('0x', '')))
      .map(value => ('0'.repeat(byteSize - value.length) + value).split('').reverse().map(bit => parseInt(bit, 10)));

    result.forEach((byte, i) => {
      const part = Math.floor(i / charSize);
      const x = i % charSize;

      byte.forEach((bit, i) => {
        setState($rows.eq((part * byteSize) + i).children('.col').eq(x), bit);
      });
    });

    return result;
  }


  for (let y = 0; y < charSize; y++) {
    $row = $('<div class="row"></div>').data('row', y);

    for (let x = 0; x < charSize; x++) {
      $row.append($('<div class="col"></div>'));
    }

    $body.append($row);
  }

  renderFromChar(' ');

  Object.keys(window.chars || {}).forEach(char => $characterSelect.append($('<option></option>').prop('value', char).html(char)));
  $characterSelect.change(() => renderFromChar($characterSelect.val()));

  $body.find('.col').click(function() {
    const $col = $(this);
    const newState = $col.data('state') ? 0 : 1;
    setState($col, newState);
    generateCode();
  });

  $input.on('input', () => generateFromCode($input.val().replace(/[^0-9,x]/g, '')));
});