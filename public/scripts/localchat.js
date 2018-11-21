
//$('#laGameChat').resizable();

function sendMessage() {
    const text = $('#chatMessage').val();
    
    socket.emit('localMessage', JSON.stringify({message: text}));

}

socket.on('localmessage', string_data => {
    const data = JSON.parse(string_data);
    const container = document.getElementById('message-container');
    
    //vulnerable to javascript injection
    //but doesnt really matter; nothing to steal
    container.innerHTML += `<div><b> ${data.user}:</b> ${data.message} </div>`;
});