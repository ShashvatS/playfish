/* socket declared in index.html */

var lastScoreOdd = -1,
  lastScoreEven = -1;

function int2filenameOld(card) {
  const type = card % 6;
  const set = (card - type) / 6;

  if (set === 8) {
    if (type === 0) return 'black_joker.png';
    if (type === 1) return 'red_joker.png';
    if (type === 2) return '8_of_clubs.png';
    if (type === 3) return '8_of_diamonds.png';
    if (type === 4) return '8_of_spades.png';
    if (type === 5) return '8_of_hearts.png';
  } else if (set % 2 === 0) {
    const vals = ['9', '10', 'jack', 'queen', 'king', 'ace'];
    const suits = ['clubs', 'diamonds', 'spades', 'hearts'];
    return vals[type] + '_of_' + suits[set / 2] + '.png';
  } else {
    const vals = ['2', '3', '4', '5', '6', '7'];
    const suits = ['hearts', 'spades', 'diamonds', 'clubs'];
    return vals[type] + '_of_' + suits[(set - 1) / 2] + '.png';
  }
}

function int2filename(card) {
  return 'images/cardimages/' + int2filenameOld(card);
}

function convertNumToName(card) {
  const type = card % 6;
  const set = (card - type) / 6;

  if (set === 8) {
    if (type === 0) return 'Black Joker';
    if (type === 1) return 'Red Joker';
    if (type === 2) return '8 of Clubs';
    if (type === 3) return '8 of Diamonds';
    if (type === 4) return '8 of Spades';
    if (type === 5) return '8 of Hearts';
  } else if (set % 2 === 0) {
    const vals = ['9', '10', 'Jack', 'Queen', 'King', 'Ace'];
    const suits = ['Clubs', 'Diamonds', 'Spades', 'Hearts'];
    return vals[type] + ' of ' + suits[set / 2];
  } else {
    const vals = ['2', '3', '4', '5', '6', '7'];
    const suits = ['Hearts', 'Spades', 'Diamonds', 'Clubs'];
    return vals[type] + ' of ' + suits[(set - 1) / 2];
  }
}

function toggle(id) {
  if (id.style.display === 'none') {
    id.style.display = 'block';
  } else {
    id.style.display = 'none';
  }
}

function toggle2(id, mode) {
  if (id.style.display === 'none') {
    id.style.display = mode;
  } else {
    id.style.display = 'none';
  }
}

function hide(obj) {
  obj.style.display = 'none';
}

function refresh() {
  socket.emit('gamestate', '');
}

socket.on('refresh', refresh);

function connect() {
  socket.emit('gamestate', '');

  const gamediv = document.getElementById('maingame');
  const connectbtn = document.getElementById('connect');
  toggle(gamediv);
  toggle(connectbtn);
}

function play_notif_sound() {
  document.getElementById('notification-sound').play();
}

function changeTitle(new_title) {
  document.title = 'Fish ' + new_title;
}

document.addEventListener('visibilitychange', function () {
  if (!document.hidden) {
    changeTitle('');
  }
});

function makeLog(gameData, names) {
  const prev_message = $('#lastmove').text();

  if (gameData.lastMove == null || gameData.lastMove === undefined) {
    $('#lastmove').text('Log: Game start');
  } else {
    let str = '';
    if (gameData.lastMove[3] === 1) {
      str = names[gameData.lastMove[0]] + ' took the ' + convertNumToName(gameData.lastMove[2]) + ' from ' + names[gameData.lastMove[1]];
    } else {
      str = names[gameData.lastMove[0]] + ' asked ' + names[gameData.lastMove[1]] + ' for the ' + convertNumToName(gameData.lastMove[2]);
    }
    $('#lastmove').text('Log: ' + str);
  }
  $('#reproducedlog').text($('#lastmove').text());

  const cur_message = $('#lastmove').text();
  if (cur_message !== prev_message) {
    play_notif_sound();
    if (document.hidden) {
      changeTitle(' | ' + cur_message);
    }
  }
}

function makeNumCardsTable(gameData) {
  for (let i = 0; i < 6; ++i) {
    $('#numcards' + i).text(String(gameData.numCards[i]));
    $('#table' + (i + 1)).css('font-weight', '');
  }
  $('#table' + (gameData.turn + 1)).css('font-weight', 'bold');
}

function makeDeclaredSets(gameData) {
  const suits = ['High Clubs', 'Low Hearts', 'High Diamonds', 'Low Spades', 'High Spades', 'Low Diamonds', 'High Hearts', 'Low Clubs', 'Jokers'];
  let declaredStr = 'Declared Sets:';
  if (gameData.declaresLog.length === 0) {
    declaredStr += ' None';
  } else {
    for (const i of gameData.declaresLog) {
      declaredStr += ' ' + suits[i] + ' |';
    }
  }
  $('#declaredsets').text(declaredStr);
}

function shrink_enlarge() {
  let div = document.getElementById('playercards2');
  toggle(div);
  div = document.getElementById('playercards2a');
  toggle(div);
  let button = document.getElementById('shrink-enlarge1');
  toggle2(button, 'inline');
  button = document.getElementById('shrink-enlarge2');
  toggle2(button, 'inline');
}

function changeAskSelection(idx) {
  const div2 = document.getElementById('playercards3');
  div2.style.display = 'block';

  const div2a = document.getElementById('playercards3a');
  div2a.style.display = 'none';

  const sel = document.getElementById('askplayer2');
  sel.selectedIndex = idx;

  const display = document.getElementById('displayaskplayer');
  display.textContent = sel.options[idx].text;
}

function makePlayerCards(gameData) {
  const div = document.getElementById('playercards2');
  $('#playercards2 img').remove();
  for (const card of gameData.cards) {
    div.innerHTML += '<img src="' + int2filename(card) + '">';
  }

  const div2a = document.getElementById('playercards2a');
  let div2apos = 0;
  let div2azpos = 0;
  $('#playercards2a img').remove();
  for (const card of gameData.cards) {
    const image = document.createElement('img');
    image.style.position = 'absolute';
    image.src = int2filename(card);
    image.style.left = div2apos + 'px';
    image.style.zIndex = div2azpos;
    div2a.appendChild(image);
    div2apos += 20;
    div2azpos += 1;
  }

  $('#playercards3 input').remove();

  const div2 = document.getElementById('playercards3');
  div2.style.display = 'none';

  const div3 = document.getElementById('playercards3a');
  div3.style.display = 'block';

  for (const card of gameData.cards) {
    div2.innerHTML += '<input type="image" class="cardinput" onClick="javascript:askTrigger(' + card + ')" src="' + int2filename(card) + '" />';
  }

  const div4 = document.getElementById('playercards4');
  div4.style.display = 'none';

  const div4a = document.getElementById('playercards4a');
  div4a.style.display = 'block';
}

function askTrigger(card) {
  $('#playercards4 input').remove();
  const div = document.getElementById('playercards4');
  div.style.display = 'block';

  const div4a = document.getElementById('playercards4a');
  div4a.style.display = 'none';

  const type = card % 6;
  const set = (card - type) / 6;

  for (let c = 6 * set; c < 6 * (set + 1); ++c) {
    div.innerHTML += '<input type="image" class="cardinput" onClick="javascript:ask2(' + c + ')" src="' + int2filename(c) + '" />';
  }
}

function ask2(ccard) {
  const div3 = document.getElementById('playercards3');
  div3.style.display = 'none';

  const div3a = document.getElementById('playercards3a');
  div3a.style.display = 'block';

  const div4 = document.getElementById('playercards4');
  div4.style.display = 'none';

  const div4a = document.getElementById('playercards4a');
  div4a.style.display = 'block';

  const data = {
    type: 'ask',
    card: ccard,
    other: +$('#askplayer2').val()
  };

  socket.emit('makemove', JSON.stringify({ data: data }));

  const display = document.getElementById('displayaskplayer');
  display.textContent = '';
}

function updateFormsForNames(data) {
  let start = (data.player + 1) % 2;
  $('.playerselectmenu .op1').text(data.names[start]).val(start);
  $('.playerselectmenu .op2').text(data.names[start + 2]).val(start + 2);
  $('.playerselectmenu .op3').text(data.names[start + 4]).val(start + 4);

  $('#askplayer2a .op1').text(data.names[start]);
  $('#askplayer2a .op2').text(data.names[start + 2]);
  $('#askplayer2a .op3').text(data.names[start + 4]);

  start = data.player % 2;
  $('.playerselectmenu3 .op1').text(data.names[start]).val(start);
  $('.playerselectmenu3 .op2').text(data.names[start + 2]).val(start + 2);
  $('.playerselectmenu3 .op3').text(data.names[start + 4]).val(start + 4);

  $('#declare2player1').text(data.names[start]);
  $('#declare2player2').text(data.names[start + 2]);
  $('#declare2player3').text(data.names[start + 4]);

  let one = (data.player + 2) % 6;
  let two = (data.player + 4) % 6;
  if (two < one) { const tmp = two; two = one; one = tmp; }

  $('.playerselectmenu2 .op1').text(data.names[one]).val(one);
  $('.playerselectmenu2 .op2').text(data.names[two]).val(two);
}

socket.on('gamestate', function (stringData) {
  const data = JSON.parse(stringData);
  const gameData = data.data;

  for (let i = 0; i < 6; ++i) {
    $('#table' + (i + 1)).text(data.names[i]);
  }

  updateFormsForNames(data);

  $('#gameroom').text('' + data.gameCode);
  $('#gameplayer').text('Player: ' + (data.player + 1));

  if (data.player % 2 === 0) {
    $('#score').text('Score: ' + gameData.scoreOdd + ' : ' + gameData.scoreEven + ' (you)');
  } else {
    $('#score').text('Score: ' + gameData.scoreOdd + ' (you) : ' + gameData.scoreEven);
  }

  const cur_total_score = gameData.scoreEven + gameData.scoreOdd;
  const last_total_score = lastScoreEven + lastScoreOdd;

  if (
    cur_total_score > last_total_score &&
    lastScoreOdd !== -1 &&
    (lastScoreEven !== gameData.scoreEven || lastScoreOdd !== gameData.scoreOdd)
  ) {
    const notification = document.querySelector('.mdl-js-snackbar');
    let message = 'A set was declared!';

    const lastDeclare = gameData.lastDeclare;
    if (lastDeclare !== undefined && lastDeclare.player >= 0) {
      const playerName = data.names[lastDeclare.player];
      const correctnessString = lastDeclare.success ? 'correctly' : 'incorrectly';
      const suits = ['High Clubs', 'Low Hearts', 'High Diamonds', 'Low Spades', 'High Spades', 'Low Diamonds', 'High Hearts', 'Low Clubs', 'Jokers'];
      const suitName = suits[lastDeclare.set];
      message = playerName + ' ' + correctnessString + ' declared the ' + suitName + '!';
    }
    notification.MaterialSnackbar.showSnackbar({ message: message });
  }

  lastScoreEven = gameData.scoreEven;
  lastScoreOdd = gameData.scoreOdd;

  makeLog(gameData, data.names);
  makeNumCardsTable(gameData);
  makeDeclaredSets(gameData);
  makePlayerCards(gameData);
});

function updateDeclareDragUI() {
  const index = document.getElementById('declareSET').selectedIndex - 1;

  let elements = document.getElementsByClassName('decarechip1');
  for (let i = 0; i < elements.length; ++i) hide(elements[i]);
  elements = document.getElementsByClassName('declarechip2');
  for (let i = 0; i < elements.length; ++i) hide(elements[i]);
  elements = document.getElementsByClassName('declarechip3');
  for (let i = 0; i < elements.length; ++i) hide(elements[i]);
  elements = document.getElementsByClassName('declarechip4');
  for (let i = 0; i < elements.length; ++i) hide(elements[i]);

  let classname = '';
  if (index === 8) classname = 'declarechip3';
  else if (index === -1) classname = 'declarechip4';
  else if (index % 2 === 0) classname = 'decarechip1';
  else classname = 'declarechip2';

  elements = document.getElementsByClassName(classname);
  for (let i = 0; i < elements.length; ++i) toggle2(elements[i], 'inline-block');
}
document.getElementById('declareSET').onchange = updateDeclareDragUI;

window.onload = function () {
  updateDeclareDragUI();
};

function predeclare() {
  const chips = document.getElementsByClassName('declarechip');
  for (let i = 0; i < chips.length; ++i) {
    const chip = chips[i];
    const box = chip.parentNode.parentNode.parentNode;

    let idx = 0;
    if (box.id === 'declarebox1') idx = 0;
    else if (box.id === 'declarebox2') idx = 1;
    else if (box.id === 'declarebox3') idx = 2;

    let item = '';
    if (chip.innerText === '2/9/Black') item = 'declare1';
    else if (chip.innerText === '3/10/Red') item = 'declare2';
    else if (chip.innerText === '4/J/Club') item = 'declare3';
    else if (chip.innerText === '5/Q/Diamond') item = 'declare4';
    else if (chip.innerText === '6/K/Spade') item = 'declare5';
    else if (chip.innerText === '7/Ace/Heart') item = 'declare6';

    const sel = document.getElementById(item);
    sel.selectedIndex = idx;
  }
}

function declare() {
  const setVal = +$('#declareSET').val();
  if (setVal === -1) return;

  predeclare();

  const moveData = { type: 'declare', set: setVal };
  for (let i = 1; i <= 6; ++i) {
    moveData[i - 1] = +$('#declare' + i).val();
  }

  socket.emit('makemove', JSON.stringify({ data: moveData }));
}

function declarealert() {
  socket.emit('declarealert', '');
}

socket.on('declarealert', function (string_data) {
  const rdata = JSON.parse(string_data);
  const notification = document.querySelector('.mdl-js-snackbar');
  notification.MaterialSnackbar.showSnackbar({ message: rdata.name + ' is about to declare!' });
});

function transfer() {
  const data = {
    type: 'transfer',
    other: +$('#transfer').val()
  };

  socket.emit('makemove', JSON.stringify({ data: data }));
}

function shuffle(array) {
  let currentIndex = array.length;
  while (currentIndex !== 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    const temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

function randomize() {
  const arr = [];
  for (let i = 0; i < 6; ++i) {
    arr[i] = $('#randomize' + (i + 1)).val();
  }
  shuffle(arr);
  for (let i = 0; i < 6; ++i) {
    $('#randomize' + (i + 1)).val(arr[i]);
  }
}
