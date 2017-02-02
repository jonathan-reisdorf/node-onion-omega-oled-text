$(() => {
  console.log(chars);
  const byte = 8;
  const size = 16;
  let $body = $('body'), $row;

  for (let y = 0; y < size; y++) {
    $row = $('<div class="row"></div>').data('row', y);

    for (let x = 0; x < size; x++) {
      $row.append($('<div class="col">0</div>').data({ col : x, state : 0 }));
    }

    $body.append($row);
  }

  $body.find('.col').click(function() {
    const $col = $(this);
    const newState = $col.data('state') ? 0 : 1;
    $col.html(newState).data('state', newState);
  });
});