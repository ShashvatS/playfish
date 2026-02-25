/* socket, showToast defined in index.html */

var messageCounter = 0;

function clearChat() {
  const mc = document.getElementById('message-container');
  const sc = document.getElementById('sidebar-message-container');
  if (mc) mc.innerHTML = '';
  if (sc) sc.innerHTML = '';
  messageCounter = 0;
  updateChatBadge();
}

function resetChatCounter() {
  messageCounter = 0;
  updateChatBadge();
}

function updateChatBadge() {
  const badge = document.getElementById('chatbadge');
  if (!badge) return;
  if (messageCounter > 0) {
    badge.textContent = messageCounter;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

function addChatMessage(user, message) {
  // Action panel chat
  const mc = document.getElementById('message-container');
  if (mc) {
    const row  = document.createElement('div');
    row.className = 'chat-msg';
    const bold = document.createElement('b');
    bold.className = 'chat-name';
    bold.textContent = user + ':';
    row.appendChild(bold);
    row.append(' ' + message);
    mc.appendChild(row);
    mc.scrollTop = mc.scrollHeight;
  }

  // Sidebar chat
  const sc = document.getElementById('sidebar-message-container');
  if (sc) {
    const row  = document.createElement('div');
    row.className = 'chat-msg';
    const bold = document.createElement('b');
    bold.className = 'chat-name';
    bold.textContent = user + ':';
    row.appendChild(bold);
    row.append(' ' + message);
    sc.appendChild(row);
    sc.scrollTop = sc.scrollHeight;
  }
}

function sendMessage() {
  const input = document.getElementById('chatMessage');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  socket.emit('localMessage', JSON.stringify({ message: text }));
  input.value = '';
}

socket.on('localmessage', function(string_data) {
  const data = JSON.parse(string_data);
  addChatMessage(data.user, data.message);

  // Badge: increment if chat tab is not active
  const chatPanel = document.getElementById('chat-panel');
  const isVisible = chatPanel && chatPanel.classList.contains('active');
  if (!isVisible) {
    messageCounter += 1;
    updateChatBadge();
  }

  if (document.hidden) {
    document.title = 'Playfish | ' + data.user + ': ' + data.message;
  }
});
