let lastScoreOdd = -1, lastScoreEven = -1;

function int2filename(card) {
  const type = card % 6;
  const set = (card - type) / 6;

  if (set === 8) {
    if (type === 0) {
      return "black_joker.png";
    } else if (type === 1) {
      return "red_joker.png";
    } else if (type === 2) {
      return "8_of_clubs.png";
    } else if (type === 3) {
      return "8_of_diamonds.png";
    } else if (type === 4) {
      return "8_of_spades.png";
    } else if (type === 5) {
      return "8_of_hearts.png";
    }

  } else if (set % 2 == 0) {
    const stringsarr = ["9", "10", "jack", "queen", "king", "ace"];
    const suitsarr = ["clubs", "diamonds", "spades", "hearts"];
    return stringsarr[type] + "_of_" + suitsarr[set / 2] + ".png";
  } else if (set % 2 == 1) {
    const stringsarr = ["2", "3", "4", "5", "6", "7"];
    const suitsarr = ["hearts", "spades", "diamonds", "clubs"];
    return stringsarr[type] + "_of_" + suitsarr[(set - 1) / 2] + ".png";
  } else {
    console.log("wtf");
  }

}

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

function convertNumToName(card) {
  const type = card % 6;
  const set = (card - type) / 6;

  if (set === 8) {
    if (type === 0) {
      return "Black Joker";
    } else if (type === 1) {
      return "Red Joker";
    } else if (type === 2) {
      return "8 of Clubs";
    } else if (type === 3) {
      return "8 of Diamonds";
    } else if (type === 4) {
      return "8 of Spades";
    } else if (type === 5) {
      return "8 of Hearts";
    }

  } else if (set % 2 == 0) {
    const stringsarr = ["9", "10", "Jack", "Queen", "King", "Ace"];
    const suitsarr = ["Clubs", "Diamonds", "Spades", "Hearts"];
    return stringsarr[type] + " of " + suitsarr[set / 2];
  } else if (set % 2 == 1) {
    const stringsarr = ["2", "3", "4", "5", "6", "7"];
    const suitsarr = ["Hearts", "Spades", "Diamonds", "Clubs"];
    return stringsarr[type] + " of " + suitsarr[(set - 1) / 2];
  } else {
    console.log("wtf");
  }
}

function refresh() {
  socket.emit('gamestate', '');
}

socket.on('refresh', refresh);

function connect() {
  socket.emit('gamestate', '');

  const gamediv = document.getElementById("maingame");
  const connectbtn = document.getElementById("connect");
  toggle(gamediv);
  toggle(connectbtn);

}


function makeLog(gameData, names) {
  if (gameData.lastMove === undefined) {
    $('#lastmove').text("Log: Game start");
  } else {
    let str = "";
    if (gameData.lastMove[3] == 1) {
      str = `${names[gameData.lastMove[0]]} took the ${convertNumToName(gameData.lastMove[2])} from ${names[gameData.lastMove[1]]}`
    } else {
      str = `${names[gameData.lastMove[0]]} asked ${names[gameData.lastMove[1]]} for the ${convertNumToName(gameData.lastMove[2])}`
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
    $('#table' + (i + 1)).css("font-weight", "");
  }

  const turn = gameData.turn + 1;
  $('#table' + (gameData.turn + 1)).css("font-weight", "bold");
}

function makeDeclaredSets(gameData) {
  const suits = ["High Clubs", "Low Hearts", "High Diamonds", "Low Spades", "High Spades", "Low Diamonds", "High Hearts", "Low Clubs", "Jokers"];
  let declaredStr = "Declared Sets:";
  if (gameData.declaresLog.length == 0) {
    declaredStr += " None";
  } else {
    for (let i of gameData.declaresLog) {
      declaredStr += " " + suits[i] + " |";
    }
  }

  $('#declaredsets').text(declaredStr);
}

function makePlayerCards(gameData) {

  const div = document.getElementById("playercards2");
  $('img').remove();
  for (let card of gameData.cards) {
    div.innerHTML += `<img src="${int2filename(card)}">`
  }

  $('#playercards3 input').remove();

  const div2 = document.getElementById("playercards3");
  for (let card of gameData.cards) {
    // div2.innerHTML += `<button onlick="javascript:askTrigger(${card})"><img src="${int2filename(card)}"></button>`;
    div2.innerHTML += `<input type="image" class="cardinput" onClick="javascript:askTrigger(${card})" src="${int2filename(card)}" />`
  }

}

function askTrigger(card) {
  $('#playercards4 input').remove();
  const div = document.getElementById("playercards4");

  const type = card % 6;
  const set = (card - type) / 6;

  for (let card = 6 * set; card < 6 * (set + 1); ++card) {
    //div.innerHTML += `<img src="${int2filename(card)}">`
    div.innerHTML += `<input type="image" class="cardinput" onClick="javascript:ask2(${card})" src="${int2filename(card)}" />`
  }

}

function ask2(ccard) {
  const data = {
    type: "ask",
    card: ccard,
    other: +$('#askplayer2').val()
  }

  socket.emit('makemove', JSON.stringify(data));
}

function updateFormsForNames(data) {

  if (true) {
    let start = ((data.player + 1) % 2);
    $('.playerselectmenu .op1').text(data.names[start]);
    $('.playerselectmenu .op1').val(start);

    $('.playerselectmenu .op2').text(data.names[start + 2]);
    $('.playerselectmenu .op2').val(start + 2);

    $('.playerselectmenu .op3').text(data.names[start + 4]);
    $('.playerselectmenu .op3').val(start + 4);
  }

  if (true) {
    start = (data.player % 2);
    $('.playerselectmenu3 .op1').text(data.names[start]);
    $('.playerselectmenu3 .op1').val(start);

    $('.playerselectmenu3 .op2').text(data.names[start + 2]);
    $('.playerselectmenu3 .op2').val(start + 2);

    $('.playerselectmenu3 .op3').text(data.names[start + 4]);
    $('.playerselectmenu3 .op3').val(start + 4);
  }

  if (true) {
    let one = (data.player + 2) % 6;
    let two = (data.player + 4) % 6;

    if (two < one) {
      let tmp = two;
      two = one;
      one = tmp;
    }

    $('.playerselectmenu2 .op1').text(data.names[one]);
    $('.playerselectmenu2 .op1').val(one);

    $('.playerselectmenu2 .op2').text(data.names[two]);
    $('.playerselectmenu2 .op2').val(two);
  }
}

socket.on('gamestate', stringData => {
  const data = JSON.parse(stringData);
  const gameData = data.data;

  for (let i = 0; i < 6; ++i) {
    $('#table' + (i + 1)).text(data.names[i]);
  }

  updateFormsForNames(data);

  //update the view
  $('#gameroom').text("Game code: " + data.gameCode);
  $('#gameplayer').text("Player: " + (data.player + 1));
  //$('#turn').text("Turn: Player " + (gameData.turn + 1));

  if (data.player % 2 == 0) {
    $('#score').text("Score: " + gameData.scoreOdd + " : " + gameData.scoreEven + " (you)");
  } else {
    $('#score').text("Score: " + gameData.scoreOdd + " (you) : " + gameData.scoreEven);
  }

  if (lastScoreOdd !== -1 && (lastScoreEven !== gameData.scoreEven || lastScoreOdd !== gameData.scoreOdd)) {
    //something changed
    const notification = document.querySelector('.mdl-js-snackbar');
    const notificationData = {
      message: 'A set was declared!'
    };

    const lastDeclare = gameData.lastDeclare;
    if (lastDeclare !== undefined) {
      const playerName = data.names[lastDeclare.player];
      const correctnessString = (lastDeclare.success) ? "correctly" : "incorrectly";
      const suits = ["High Clubs", "Low Hearts", "High Diamonds", "Low Spades", "High Spades", "Low Diamonds", "High Hearts", "Low Clubs", "Jokers"];
      const suitName = suits[lastDeclare.set];
      notificationData.message = `${playerName} ${correctnessString} declared the ${suitName}!`;
    }
    notification.MaterialSnackbar.showSnackbar(notificationData);
  } 

  lastScoreEven = gameData.scoreEven;
  lastScoreOdd = gameData.scoreOdd;

  makeLog(gameData, data.names);
  makeNumCardsTable(gameData);
  makeDeclaredSets(gameData);
  makePlayerCards(gameData);

});

function declare() {
  const data = {};
  for (let i = 1; i <= 6; ++i) {
    let id = "#declare" + i;
    data[i - 1] = $(id).val();
  }
  data.type = "declare";
  //data.set = +$('#declaresuit').val() - 1;
  data.set = +$('#declareSET').val();

  socket.emit('makemove', JSON.stringify(data));
}

function declarealert() {
    //           declarealert 
    socket.emit("declarealert", "");
}

socket.on('declarealert', (string_data) => {
    const rdata = JSON.parse(string_data);

    const notification = document.querySelector('.mdl-js-snackbar');
    const data = {
        message: `${rdata.name} is about to declare!`
    };
    notification.MaterialSnackbar.showSnackbar(data);

});

function transfer() {
  const data = {
    type: "transfer",
    other: +$('#transfer').val()
  };

  socket.emit('makemove', JSON.stringify(data));
}

socket.on('makemovestatus', stringStatus => {

});

socket.on('gamestatestatus', stringStatus => {

});

function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function randomize() {
  let arr = [-1, -1, -1, -1, -1, -1];

  for (let i = 0; i < 6; ++i) {
    arr[i] = $('#randomize' + (i + 1)).val();
  }

  shuffle(arr);

  for (let i = 0; i < 6; ++i) {
    $('#randomize' + (i + 1)).val(arr[i]);
  }

}