/* socket declared in index.html */

var joinstatus = null;

function join() {
  const gameCode = String($('#gamecode').val()).trim();
  const player = +$('#player').val() - 1;
  const name = String($('#playername').val()).trim();

  if (!gameCode) {
    const notification = document.querySelector('.mdl-js-snackbar');
    notification.MaterialSnackbar.showSnackbar({ message: 'Please enter a game code.' });
    return;
  }

  const data = { game: gameCode, player: player, name: name };

  // Open WebSocket to this game room, then send the join message
  socket.connect(gameCode, function () {
    socket.emit('join', JSON.stringify(data));
  });

  clearChat();
}

function wjoin() {
  const gameCode = String($('#gamecode').val()).trim();
  const player = +$('#player').val() - 1;
  const name = String($('#playername').val()).trim();

  if (!gameCode) {
    const notification = document.querySelector('.mdl-js-snackbar');
    notification.MaterialSnackbar.showSnackbar({ message: 'Please enter a game code.' });
    return;
  }

  const data = { game: gameCode, player: player, name: name };

  socket.connect(gameCode, function () {
    socket.emit('watch', JSON.stringify(data));
  });

  clearChat();
}

socket.on('joinstatus', function (stringStatus) {
  const status = JSON.parse(stringStatus);
  let message = '';
  if (status.success) {
    message = 'Game joined!';
    if (status.spectator === true) {
      joinstatus = 'spectate';
    } else {
      joinstatus = 'player';
    }
  } else if (status.reason !== undefined) {
    if (status.reason === 'invalid') message = 'Sent invalid data to the server! Try checking the game code.';
    else if (status.reason === 'you already joined') message = 'Already in this game!';
    else if (status.reason === 'already 6 players') message = 'There are already 6 players in the game! Maybe one of them can leave?';
    else if (status.reason === 'someone else already joined') message = 'Someone else is already this player! Join as a different player or have them leave.';
    else if (status.reason === 'duplicate name') message = 'Someone else already took your name!';
    else if (status.reason === 'player hasnt joined yet') message = 'That player hasn\'t joined yet — you can only spectate someone who is already in the game.';
    else message = 'Could not join for unknown reason: ' + status.reason;
  } else {
    message = 'Failed to join game for unknown reason!';
  }

  const notification = document.querySelector('.mdl-js-snackbar');
  notification.MaterialSnackbar.showSnackbar({ message: message });
});

function leaveGame() {
  socket.emit('leave', '');
  joinstatus = null;
}

socket.on('leavestatus', function (stringStatus) {
  const status = JSON.parse(stringStatus);
  let message = '';
  if (status.success && status.reason === 'left game') message = 'Left game!';
  else if (status.success && status.reason === 'nothing to leave') message = 'Currently not in a game!';
  else message = 'Failed to leave game!';

  const notification = document.querySelector('.mdl-js-snackbar');
  notification.MaterialSnackbar.showSnackbar({ message: message });
});

socket.on('spectatorjoinedgame', function (stringData) {
  const data = JSON.parse(stringData);
  let message = '';

  if (!data.name) {
    message = 'An unknown player is now spectating the game.';
  } else {
    message = data.name + ' is now spectating your game!';
  }

  const notification = document.querySelector('.mdl-js-snackbar');
  notification.MaterialSnackbar.showSnackbar({ message: message });
});
