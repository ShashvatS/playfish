/* eslint-env browser */
(function() {
  'use strict';

  const socket = io();

  socket.on('connection', () => {});
  let joined = false;

  function join() {
    const data = {
      game: $('#gamecode').val(),
      player: $('#player').val()
    };

    socket.emit('join', JSON.stringify(data));
  }
  socket.on('joinstatus', stringData => {
    console.log(stringData);
  });

  setInterval(() => {
    socket.emit('gamestate', '');
  }, 1000);

  socket.on('gamestate', data => {
    joined = true;
    console.log(joined);
    console.log(JSON.parse(data));
  });

  // Your custom JavaScript goes here
})();
