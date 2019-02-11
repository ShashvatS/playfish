/* socket already declared in index.html */

function join() {
  const data = {
    game: $('#gamecode').val(),
    player: +$('#player').val() - 1,
    name: $('#playername').val()
  };

  socket.emit('join', JSON.stringify(data));
}

function wjoin() {
  const data = {
    game: $('#gamecode').val(),
    player: +$('#player').val() - 1
  };

  //don't think we need this
  // socket.close();
  // socket.open();

  socket.emit('watch', JSON.stringify(data));
}

socket.on('joinstatus', stringStatus => {
  const status = JSON.parse(stringStatus);
  let data = {};
  if (status.success) data.message = "Game joined!";
  else if (status.reason !== undefined) {
    if (status.reason === "invalid") data.message = "Sent invalid data to the server! Try checking the game code.";
    else if (status.reason === "you already joined") data.message = "Already in this game!";
    else if (status.reason === "already 6 players") data.message = "There are already 6 players in the game! Maybe one of them can leave?";
    else if (status.reason === "someone else already joined") data.message = "Someone else is already this player! Join as a different player or have them leave.";
    else if (status.reason === "duplicate name") data.message = "Someone else already took your name!";
    else data.message = "Could not join for unknown reason: " + status.reason;
  }
  else data.message = 'Failed to join game for unknown reason!';

  const notification = document.querySelector('.mdl-js-snackbar');
  notification.MaterialSnackbar.showSnackbar(data);
});

function leaveGame() {
    const data = "";
    socket.emit('leave', data);
}

socket.on('leavestatus', stringStatus => {
  const status = JSON.parse(stringStatus);
  let data = {};
  if (status.success && status.reason === "left game") data.message = "Left game!";
  else if (status.success && status.reason === "nothing to leave") data.message = "Currently not in a game!"
  else data.message = 'Failed to leave game!';

  const notification = document.querySelector('.mdl-js-snackbar');
  notification.MaterialSnackbar.showSnackbar(data);
});