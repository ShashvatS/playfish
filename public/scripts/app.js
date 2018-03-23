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
      str = `Player ${gameData.lastMove[0] + 1} took the ${convertNumToName(gameData.lastMove[2])} from Player ${gameData.lastMove[1] + 1}`
    } else {
      str = `Player ${gameData.lastMove[0] + 1} asked Player ${gameData.lastMove[1] + 1} for ${convertNumToName(gameData.lastMove[2])}`
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

{/* <option value="0">High Clubs</option>
<option value="7">Low Clubs</option>
<option value="6">High Hearts</option>
<option value="1">Low Hearts</option>
<option value="4">High Spades</option>
<option value="3">Low Spades</option>
<option value="2">High Diamonds</option>
<option value="5">Low Diamonds</option>
<option value="8">Jokers</option> */}
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
  // $('.card').remove();
  // for (let card of gameData.cards) {
  //   $('#playercards').append(`<div class="card"><span> ${convertNumToCoordinates(card)} </span></div>`);
  // }


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
    other: +$('#askplayer2').val() - 1
  }

  socket.emit('makemove', JSON.stringify(data));
}

socket.on('gamestate', stringData => {
  const data = JSON.parse(stringData);
  const gameData = data.data;

  //update the view
  $('#gameroom').text("Game code: " + data.gameCode);
  $('#gameplayer').text("Player: " + (data.player + 1));
  //$('#turn').text("Turn: Player " + (gameData.turn + 1));

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

// function ask() {
//   const data = {
//     type: "ask",
//     card: convertCoordinatetoNum(+$('#askcard').val()),
//     other: +$('#askplayer').val() - 1
//   }

//   socket.emit('makemove', JSON.stringify(data));
// }

function declare() {
  const data = {};
  for (let i = 1; i <= 6; ++i) {
    let id = "#declare" + i;
    data[i - 1] = $(id).val() - 1;
  }
  data.type = "declare";
  //data.set = +$('#declaresuit').val() - 1;
  data.set = +$('#declareSET').val();

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


for (let i = 0; i < 54; ++i) {
  console.log(int2filename(i));
}