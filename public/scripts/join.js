/* socket already declared in index.html */

function join() {
  const data = {
    game: $('#gamecode').val(),
    player: +$('#player').val() - 1
  };

  socket.emit('join', JSON.stringify(data));
}

socket.on('joinstatus', stringStatus => {
  const status = JSON.parse(stringStatus);
  let data = {};
  if (status.success) data.message = "Game joined!";
  else if (status.reason !== undefined && status.reason === "already joined") data.message = 'Already in this game!';
  else data.message = 'Failed to join game!';

  const notification = document.querySelector('.mdl-js-snackbar');
  notification.MaterialSnackbar.showSnackbar(data);
});