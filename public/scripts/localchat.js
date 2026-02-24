/* socket declared in index.html */

var messageCounter = 0;

function clearChat() {
  $('#message-container div').remove();
}

function resetChatCounter() {
  messageCounter = 0;

  const chatbadge = document.getElementById('chatbadge');
  chatbadge.dataset.badge = messageCounter;

  $('#chatbadge').removeClass('numberbadge');
}

function sendMessage() {
  const text = $('#chatMessage').val();

  socket.emit('localMessage', JSON.stringify({ message: text }));
  $('#chatMessage').val('');
}

socket.on('localmessage', function (string_data) {
  const data = JSON.parse(string_data);
  const container = document.getElementById('message-container');

  const row = document.createElement('div');
  const bold = document.createElement('b');
  bold.textContent = ' ' + data.user + ':';
  row.appendChild(bold);
  row.append(' ' + data.message + ' ');
  container.appendChild(row);

  const chatbox = document.getElementById('chatbox');
  if (chatbox.style.display === 'none') {
    messageCounter += 1;

    const chatbadge = document.getElementById('chatbadge');
    chatbadge.dataset.badge = messageCounter;
    $('#chatbadge').addClass('numberbadge');
  }

  if (document.hidden) {
    document.title = 'Fish | ' + data.user + ': ' + data.message;
  }
});
