
//$('#laGameChat').resizable();

function sendMessage() {
    const text = $('#chatMessage').val();
    
    socket.emit('localMessage', JSON.stringify({message: text}));

}

socket.on('localmessage', string_data => {
    const data = JSON.parse(string_data);
    const container = document.getElementById('message-container');
    
    
    container.innerHTML += `<div><b> ${data.user}:</b> ${data.message} </div>`
});