/* socket, showToast, showGameScreen defined in index.html */

var lastScoreOdd = -1, lastScoreEven = -1;

/* ─── Card helpers ─── */
function int2filenameBase(card) {
  const type = card % 6;
  const set  = (card - type) / 6;
  if (set === 8) {
    const names = ['black_joker','red_joker','8_of_clubs','8_of_diamonds','8_of_spades','8_of_hearts'];
    return names[type] + '.png';
  } else if (set % 2 === 0) {
    const vals  = ['9','10','jack','queen','king','ace'];
    const suits = ['clubs','diamonds','spades','hearts'];
    return vals[type] + '_of_' + suits[set / 2] + '.png';
  } else {
    const vals  = ['2','3','4','5','6','7'];
    const suits = ['hearts','spades','diamonds','clubs'];
    return vals[type] + '_of_' + suits[(set - 1) / 2] + '.png';
  }
}
function int2filename(card) { return 'images/cardimages/' + int2filenameBase(card); }

function convertNumToName(card) {
  const type = card % 6;
  const set  = (card - type) / 6;
  if (set === 8) {
    return ['Black Joker','Red Joker','8 of Clubs','8 of Diamonds','8 of Spades','8 of Hearts'][type];
  } else if (set % 2 === 0) {
    const vals  = ['9','10','Jack','Queen','King','Ace'];
    const suits = ['Clubs','Diamonds','Spades','Hearts'];
    return vals[type] + ' of ' + suits[set / 2];
  } else {
    const vals  = ['2','3','4','5','6','7'];
    const suits = ['Hearts','Spades','Diamonds','Clubs'];
    return vals[type] + ' of ' + suits[(set - 1) / 2];
  }
}

/* ─── Utility ─── */
function refresh() { socket.emit('gamestate', ''); }
socket.on('refresh', refresh);

function play_notif_sound() {
  const el = document.getElementById('notification-sound');
  if (el) el.play().catch(() => {});
}

function changeTitle(suffix) { document.title = 'Playfish' + suffix; }

document.addEventListener('visibilitychange', function() {
  if (!document.hidden) changeTitle('');
});

/* ─── Card view toggle ─── */
let cardsExpanded = false;
function shrink_enlarge() {
  cardsExpanded = !cardsExpanded;
  const expanded = document.getElementById('playercards2');
  const compact  = document.getElementById('playercards2a');
  const btn      = document.getElementById('toggle-card-view');
  if (cardsExpanded) {
    expanded.style.display = 'flex';
    compact.style.display  = 'none';
    if (btn) btn.textContent = 'Compact';
  } else {
    expanded.style.display = 'none';
    compact.style.display  = 'block';
    if (btn) btn.textContent = 'Expand';
  }
}

/* ─── Game log ─── */
function makeLog(gameData, names) {
  const el = document.getElementById('lastmove');
  const prev = el.textContent;
  let str;
  if (!gameData.lastMove) {
    str = 'Game start';
  } else if (gameData.lastMove[3] === 1) {
    str = names[gameData.lastMove[0]] + ' took the ' +
          convertNumToName(gameData.lastMove[2]) + ' from ' + names[gameData.lastMove[1]];
  } else {
    str = names[gameData.lastMove[0]] + ' asked ' + names[gameData.lastMove[1]] +
          ' for the ' + convertNumToName(gameData.lastMove[2]);
  }
  el.textContent = str;

  if (str !== prev) {
    play_notif_sound();
    if (document.hidden) changeTitle(' | ' + str);
  }
}

/* ─── Player row ─── */
function makeNumCardsTable(gameData) {
  for (let i = 0; i < 6; i++) {
    const nc = document.getElementById('numcards' + i);
    if (nc) nc.textContent = gameData.numCards[i];
    const cell = document.getElementById('pcell-' + i);
    if (cell) cell.classList.toggle('is-turn', gameData.turn === i);
  }
}

/* ─── Declared sets ─── */
const SET_NAMES = ['High Clubs','Low Hearts','High Diamonds','Low Spades',
                   'High Spades','Low Diamonds','High Hearts','Low Clubs','Jokers & 8s'];
// declares array: 0=undeclared,1=odd won,2=even won,3=?
// Team: even indices (0,2,4) = "even team"; odd indices (1,3,5) = "odd team"
// declares[set]: 2 = even team declared, 3 = odd team declared (from game.ts)
function makeDeclaredSets(gameData) {
  // Sidebar text
  const sidebar = document.getElementById('declaredsets');
  // Declared bar
  const inner = document.getElementById('declaredsets-inner');
  if (!inner) return;
  inner.innerHTML = '';

  if (!gameData.declaresLog || gameData.declaresLog.length === 0) {
    if (sidebar) sidebar.textContent = 'None yet';
    return;
  }

  let sidebarText = '';
  for (const setIdx of gameData.declaresLog) {
    const name = SET_NAMES[setIdx] || ('Set ' + setIdx);
    // declares[set]: 2=even team scored, 3=odd team scored, 0=odd team scored (wrong declare by even), 1=even team scored (wrong declare by odd)
    const val  = gameData.declares[setIdx];
    const team = (val === 2 || val === 1) ? 'even' : 'odd';
    const tag  = document.createElement('span');
    tag.className = 'declared-tag ' + team;
    tag.textContent = name;
    inner.appendChild(tag);
    sidebarText += (sidebarText ? ', ' : '') + name;
  }
  if (sidebar) sidebar.textContent = sidebarText || 'None yet';
}

/* ─── Player cards display ─── */
function makePlayerCards(gameData) {
  // Expanded view
  const expanded = document.getElementById('playercards2');
  expanded.innerHTML = '';
  for (const card of gameData.cards) {
    const img = document.createElement('img');
    img.src = int2filename(card);
    img.alt = convertNumToName(card);
    img.className = 'card-img';
    expanded.appendChild(img);
  }

  // Compact (stacked) view
  const compact = document.getElementById('playercards2a');
  compact.innerHTML = '';
  let pos = 0;
  for (const card of gameData.cards) {
    const img = document.createElement('img');
    img.className = 'card-img-compact';
    img.src = int2filename(card);
    img.alt = convertNumToName(card);
    img.style.left = pos + 'px';
    img.style.zIndex = pos;
    compact.appendChild(img);
    pos += 20;
  }
  // Adjust compact container width
  if (gameData.cards.length > 0) {
    compact.style.width = (pos + 60) + 'px';
  }

  // Ask panel – clickable copies of your cards
  const ask3 = document.getElementById('playercards3');
  const ask3a = document.getElementById('playercards3a');
  ask3.innerHTML = '';
  ask3a.innerHTML = '';
  for (const card of gameData.cards) {
    const btn = document.createElement('button');
    btn.className = 'ask-card-btn';
    btn.setAttribute('onclick', 'askTrigger(' + card + ')');
    const img = document.createElement('img');
    img.src = int2filename(card);
    img.alt = convertNumToName(card);
    btn.appendChild(img);
    ask3a.appendChild(btn);
    // also build ask3 (shown after set selection — just shows all in set)
  }
  // hide step-3 until user clicks a card
  const step3 = document.getElementById('ask-step3');
  if (step3) step3.style.display = 'none';
  const ask4 = document.getElementById('playercards4');
  if (ask4) ask4.innerHTML = '';
}

/* ─── Ask flow ─── */
function askTrigger(card) {
  const type = card % 6;
  const set  = (card - type) / 6;
  const step3 = document.getElementById('ask-step3');
  const ask4  = document.getElementById('playercards4');
  ask4.innerHTML = '';
  for (let c = 6 * set; c < 6 * (set + 1); c++) {
    const btn = document.createElement('button');
    btn.className = 'ask-card-btn';
    btn.setAttribute('onclick', 'ask2(' + c + ')');
    const img = document.createElement('img');
    img.src = int2filename(c);
    img.alt = convertNumToName(c);
    btn.appendChild(img);
    ask4.appendChild(btn);
  }
  if (step3) step3.style.display = 'block';
}

function ask2(ccard) {
  if (selectedAskOpponent === -1) {
    showToast('Please select an opponent first (Step 1).');
    return;
  }
  const data = { type: 'ask', card: ccard, other: selectedAskOpponent };
  socket.emit('makemove', JSON.stringify({ data: data }));

  // Reset UI
  selectedAskOpponent = -1;
  document.querySelectorAll('.ask-opp-btn').forEach(b => b.classList.remove('selected'));
  const step3 = document.getElementById('ask-step3');
  if (step3) step3.style.display = 'none';
  const ask4 = document.getElementById('playercards4');
  if (ask4) ask4.innerHTML = '';
}

/* ─── Update names in forms ─── */
function updateFormsForNames(data) {
  // Opponents for ask (other team parity)
  const oppStart = (data.player + 1) % 2;
  const opps = [oppStart, oppStart + 2, oppStart + 4];

  const oppBtns = document.querySelectorAll('#askplayer2a .ask-opp-btn');
  const askSel  = document.getElementById('askplayer2');
  const askOpts = askSel ? askSel.querySelectorAll('option') : [];
  for (let i = 0; i < 3; i++) {
    const name = data.names[opps[i]] || ('P' + (opps[i]+1));
    if (oppBtns[i]) { oppBtns[i].textContent = name; oppBtns[i].dataset.player = opps[i]; }
    if (askOpts[i]) { askOpts[i].textContent = name; askOpts[i].value = opps[i]; }
  }

  // Teammates for declare (all 3, including self)
  const teamStart = data.player % 2;
  const team = [teamStart, teamStart + 2, teamStart + 4];
  const dLabels = ['declare2player1','declare2player2','declare2player3'];
  const dBoxes  = ['declarebox1','declarebox2','declarebox3'];
  for (let i = 0; i < 3; i++) {
    const lbl = document.getElementById(dLabels[i]);
    const box = document.getElementById(dBoxes[i]);
    const name = data.names[team[i]] || ('P' + (team[i]+1));
    if (lbl) lbl.textContent = name;
    if (box) box.dataset.player = team[i];
  }

  // Teammates for transfer (excluding self)
  let one = (data.player + 2) % 6;
  let two = (data.player + 4) % 6;
  if (two < one) { const tmp = two; two = one; one = tmp; }
  const tBtns = document.querySelectorAll('#transfer-buttons button');
  const tSel  = document.getElementById('transfer');
  const tOpts = tSel ? tSel.querySelectorAll('option') : [];
  [[one, 0],[two, 1]].forEach(([p, i]) => {
    const name = data.names[p] || ('P' + (p+1));
    if (tBtns[i]) { tBtns[i].textContent = name; tBtns[i].dataset.player = p; }
    if (tOpts[i]) { tOpts[i].value = p; tOpts[i].textContent = name; }
  });
}

/* ─── Declare drag UI ─── */
function updateDeclareDragUI() {
  const setVal = parseInt(document.getElementById('declareSET').value);
  const unassigned = document.getElementById('declare-unassigned');
  ['declarebox1','declarebox2','declarebox3'].forEach(id => {
    document.getElementById(id).innerHTML = '';
  });
  unassigned.innerHTML = '';
  if (isNaN(setVal) || setVal === -1) return;

  for (let i = 0; i < 6; i++) {
    const cardNum = setVal * 6 + i;
    const chip = document.createElement('div');
    chip.className = 'declare-chip';
    chip.dataset.cardIdx = i;
    const img = document.createElement('img');
    img.src = int2filename(cardNum);
    img.alt = convertNumToName(cardNum);
    chip.appendChild(img);
    const lbl = document.createElement('span');
    // Short rank label
    lbl.textContent = convertNumToName(cardNum).split(' of ')[0];
    chip.appendChild(lbl);
    unassigned.appendChild(chip);
  }
}

/* ─── Declare submit ─── */
function declare() {
  const setVal = parseInt(document.getElementById('declareSET').value);
  if (isNaN(setVal) || setVal === -1) { showToast('Please select a set first.'); return; }

  const unassigned = document.getElementById('declare-unassigned');
  if (unassigned && unassigned.querySelectorAll('.declare-chip').length > 0) {
    showToast('All 6 cards must be assigned to a player!');
    return;
  }

  const moveData = { type: 'declare', set: setVal };
  ['declarebox1','declarebox2','declarebox3'].forEach(id => {
    const box    = document.getElementById(id);
    const player = parseInt(box.dataset.player);
    box.querySelectorAll('.declare-chip').forEach(chip => {
      moveData[parseInt(chip.dataset.cardIdx)] = player;
    });
  });

  socket.emit('makemove', JSON.stringify({ data: moveData }));
}

/* ─── Declare alert ─── */
function declarealert() { socket.emit('declarealert', ''); }
socket.on('declarealert', function(stringData) {
  const rdata = JSON.parse(stringData);
  showToast(rdata.name + ' is about to declare!');
});

/* ─── Transfer ─── */
function transfer(playerNum) {
  if (playerNum === -1 || isNaN(playerNum)) { showToast('No teammate selected.'); return; }
  const data = { type: 'transfer', other: playerNum };
  socket.emit('makemove', JSON.stringify({ data: data }));
}

/* ─── Main gamestate handler ─── */
socket.on('gamestate', function(stringData) {
  const data     = JSON.parse(stringData);
  const gameData = data.data;

  // Player names in row
  for (let i = 0; i < 6; i++) {
    const el = document.getElementById('table' + (i + 1));
    if (el) el.textContent = data.names[i] || ('P' + (i+1));
  }

  updateFormsForNames(data);

  // Game code
  const roomEl = document.getElementById('gameroom');
  if (roomEl) roomEl.textContent = data.gameCode;

  // Player badge
  const playerEl = document.getElementById('gameplayer');
  if (playerEl) playerEl.textContent = 'Player ' + (data.player + 1);

  // game.ts: player%2===0 → team scoreEven; player%2===1 → team scoreOdd
  const scoreEl = document.getElementById('score');
  if (scoreEl) {
    if (data.player % 2 === 0) {
      // You are the even team (scoreEven)
      scoreEl.textContent = gameData.scoreEven + ' (you) – ' + gameData.scoreOdd;
    } else {
      // You are the odd team (scoreOdd)
      scoreEl.textContent = gameData.scoreOdd + ' (you) – ' + gameData.scoreEven;
    }
  }

  // Declare notification
  const curTotal  = gameData.scoreEven + gameData.scoreOdd;
  const lastTotal = lastScoreEven + lastScoreOdd;
  if (curTotal > lastTotal && lastScoreOdd !== -1) {
    let msg = 'A set was declared!';
    const ld = gameData.lastDeclare;
    if (ld && ld.player >= 0) {
      const suits = ['High Clubs','Low Hearts','High Diamonds','Low Spades',
                     'High Spades','Low Diamonds','High Hearts','Low Clubs','Jokers & 8s'];
      msg = data.names[ld.player] + ' ' + (ld.success ? 'correctly' : 'incorrectly') +
            ' declared ' + suits[ld.set] + '!';
    }
    showToast(msg);
  }
  lastScoreEven = gameData.scoreEven;
  lastScoreOdd  = gameData.scoreOdd;

  makeLog(gameData, data.names);
  makeNumCardsTable(gameData);
  makeDeclaredSets(gameData);
  makePlayerCards(gameData);
});

/* ─── Randomizer (landing page) ─── */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function randomize() {
  const vals = [];
  for (let i = 1; i <= 6; i++) {
    const el = document.getElementById('randomize' + i);
    vals.push(el ? el.value : '');
  }
  shuffle(vals);
  for (let i = 1; i <= 6; i++) {
    const el = document.getElementById('randomize' + i);
    if (el) el.value = vals[i - 1];
  }
}

/* ─── Sidebar chat helper (mirror to action chat) ─── */
function sendSidebarMessage() {
  const input = document.getElementById('sidebar-chatMessage');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  socket.emit('localMessage', JSON.stringify({ message: text }));
  input.value = '';
}
