
//$('#laGameChat').resizable();

let messageCounter = 0;

function clearChat() {
    $('#message-container div').remove();
}

function resetChatCounter() {
    messageCounter = 0;

    const chatbadge = document.getElementById("chatbadge");
    chatbadge.dataset.badge = messageCounter;

    $('#chatbadge').removeClass("numberbadge");
}

function sendMessage() {
    const text = $('#chatMessage').val();
    
    socket.emit('localMessage', JSON.stringify({message: text}));
    $('#chatMessage').val('');
}

socket.on('localmessage', string_data => {
    const data = JSON.parse(string_data);
    const container = document.getElementById('message-container');
    
    //vulnerable to javascript injection
    //but doesnt really matter; nothing to steal
    container.innerHTML += `<div><b> ${data.user}:</b> ${data.message} </div>`;

    let chatbox = document.getElementById("chatbox");
    if (chatbox.style.display === "none") {
        messageCounter += 1;

        const chatbadge = document.getElementById("chatbadge");
        chatbadge.dataset.badge = messageCounter;
        $('#chatbadge').addClass("numberbadge");
    }



});