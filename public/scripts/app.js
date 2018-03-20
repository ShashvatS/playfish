/* socket already declared in index.html */

function toggle(id) {
  if (id.style.display === "none") {
    id.style.display = "block";
  } else {
    id.style.display = "none";
  }
}

function hide(obj) {
  obj.style.display = "none";
}

function convertCoordinatetoNum(num) {
  const card = num % 10;
  const set = (num - card) / 10 - 1;

  return 6 * set + card;
}

function convertNumToCoordinates(num) {
  const card = num % 6;
  const set = (num - card) / 6;
  return 10 * (set + 1) + card;
}

function refresh() {
  socket.emit('gamestate', '');
}

function connect() {
  socket.emit('gamestate', '');

  const gamediv = document.getElementById("maingame");
  const connectbtn = document.getElementById("connect");
  toggle(gamediv);
  toggle(connectbtn);
}


function makeLog(gameData) {
  if (gameData.lastMove === undefined) {
    $('#lastmove').text("Log: Game start");
  } else {
    let str = "";
    if (gameData.lastMove[3] == 1) {
      str = `Player ${gameData.lastMove[0] + 1} took ${convertNumToCoordinates(gameData.lastMove[2])} from Player ${gameData.lastMove[1] + 1}`
    } else {
      str = `Player ${gameData.lastMove[0] + 1} asked Player ${gameData.lastMove[1] + 1} for ${convertNumToCoordinates(gameData.lastMove[2])}`
    }
    $('#lastmove').text("Log: " + str);
  }
}

function makeNumCardsTable(gameData) {
  const numCardsArr = gameData.numCards.map((x, i) => {
    return `${x}`;
  });
  for (let i = 0; i < 6; ++i) {
    $('#numcards' + i).text(numCardsArr[i]);
  }
}

function makeDeclaredSets(gameData) {
  let declaredStr = "Declared Sets:";
  if (gameData.declaresLog.length == 0) {
    declaredStr += " None";
  } else {
    for (let i of gameData.declaresLog) {
      declaredStr += " " + (i + 1);
    }
  }

  $('#declaredsets').text(declaredStr);
}

function makePlayerCards(gameData) {
  // let cardsStr = "";
  // for (let card of gameData.cards) {
  //   cardsStr += convertNumToCoordinates(card) + " ";
  // }

  // $('#playercards').text(cardsStr);

  // $('#playercards').remove('.card');
  $('.card').remove();
  for (let card of gameData.cards) {
    $('#playercards').append(`<div class="card"><span> ${convertNumToCoordinates(card)} </span></div>`);
  }

}

socket.on('gamestate', stringData => {
  const data = JSON.parse(stringData);
  const gameData = data.data;

  //update the view
  $('#gameroom').text("Game code: " + data.gameCode);
  $('#gameplayer').text("Player: " + (data.player + 1));
  $('#turn').text("Turn: Player " + (gameData.turn + 1));

  if (data.player % 2 == 0) {
    $('#score').text("Score: " + gameData.scoreOdd + " : " + gameData.scoreEven + " (you)");
  } else {
    $('#score').text("Score: " + gameData.scoreOdd + " (you) : " + gameData.scoreEven);
  }

  makeLog(gameData);
  makeNumCardsTable(gameData);
  makeDeclaredSets(gameData);
  makePlayerCards(gameData);

});

function ask() {
  const data = {
    type: "ask",
    card: convertCoordinatetoNum(+$('#askcard').val()),
    other: +$('#askplayer').val() - 1
  }

  socket.emit('makemove', JSON.stringify(data));
}

function declare() {
  const data = {};
  for (let i = 1; i <= 6; ++i) {
    let id = "#declare" + i;
    data[i - 1] = $(id).val() - 1;
  }
  data.type = "declare";
  data.set = +$('#declaresuit').val() - 1;

  socket.emit('makemove', JSON.stringify(data));
}

function transfer() {
  const data = {
    type: "transfer",
    other: +$('#transfer').val() - 1
  };

  socket.emit('makemove', JSON.stringify(data));
}

socket.on('makemovestatus', stringStatus => {

});

socket.on('gamestatestatus', stringStatus => {

});