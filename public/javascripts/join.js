const socket = io();

function join() {
    const data = {
        game: $('#gamecode').val()
    }

    socket.emit('joingame', JSON.stringify(data));
}

function player() {
    if (isNaN($('#player').val())) return;

    const data = {
        number: +$('#player').val()
    }

    socket.emit('player', JSON.stringify(data));
}

function ask() {
    const other = $('#other').val();
    const card = $('#card').val();

    if (isNaN(other) || isNaN(card)) return;
    console.log('here');
    const data = {
        type: "ask",
        other: +$('#other').val(),
        card: +$('#card').val()
    };

    socket.emit('makemove', JSON.stringify(data));
}

setInterval(() => {
    socket.emit('gamestate', '');
}, 1000);

socket.on('gamestate', (data) => {
    console.log(JSON.parse(data));
});

socket.on('joingamestatus', (data) => {
    console.log(data);
});