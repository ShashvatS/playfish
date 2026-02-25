/* socket, showToast, showGameScreen, showScreen defined in index.html */

var joinstatus = null;

function join() {
  const gameCode = document.getElementById('gamecode').value.trim();
  const player   = parseInt(document.getElementById('player').value) - 1; // 0-based
  const name     = document.getElementById('playername').value.trim();

  if (!gameCode) { showToast('Please enter a game code.'); return; }

  socket.connect(gameCode, function() {
    socket.emit('join', JSON.stringify({ game: gameCode, player: player, name: name }));
  });

  clearChat();
}

function wjoin() {
  const gameCode = document.getElementById('gamecode').value.trim();
  const player   = parseInt(document.getElementById('player').value) - 1;
  const name     = document.getElementById('playername').value.trim();

  if (!gameCode) { showToast('Please enter a game code.'); return; }

  socket.connect(gameCode, function() {
    socket.emit('watch', JSON.stringify({ game: gameCode, player: player, name: name }));
  });

  clearChat();
}

socket.on('joinstatus', function(stringStatus) {
  const status = JSON.parse(stringStatus);
  let message = '';

  if (status.success) {
    // Server sends same response for players and spectators
    joinstatus = 'player';
    message = 'Joined!';

    // Update URL with game code (shareable link)
    const gameCode = document.getElementById('gamecode').value.trim();
    if (gameCode) {
      history.replaceState(null, '', '?gamecode=' + gameCode);
    }

    // Auto-show game screen
    showGameScreen();
  } else if (status.reason !== undefined) {
    const reasons = {
      'invalid':                   'Sent invalid data — check the game code.',
      'you already joined':        'Already in this game!',
      'already 6 players':         'There are already 6 players — maybe one can leave?',
      'someone else already joined': 'Someone else is already that player. Pick a different number or ask them to leave.',
      'duplicate name':            'That name is taken! Pick a different one.',
      'player hasnt joined yet':   'That player hasn\'t joined yet — you can only spectate someone in the game.',
    };
    message = reasons[status.reason] || ('Could not join: ' + status.reason);
  } else {
    message = 'Failed to join game for an unknown reason.';
  }

  showToast(message);
});

function leaveGame() {
  socket.emit('leave', '');
  joinstatus = null;
}

socket.on('leavestatus', function(stringStatus) {
  const status = JSON.parse(stringStatus);
  let message;
  if (status.success && status.reason === 'left game')         message = 'Left game!';
  else if (status.success && status.reason === 'nothing to leave') message = 'Not currently in a game.';
  else                                                          message = 'Failed to leave game.';
  showToast(message);
  showScreen('landing');
});

socket.on('spectatorjoinedgame', function(stringData) {
  const data = JSON.parse(stringData);
  const msg  = data.name ? (data.name + ' is now spectating your game!') : 'Someone is now spectating your game.';
  showToast(msg);
});
