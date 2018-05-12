"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request = require("request");
var schedule = require("node-schedule");
var util = require("./util");
var game = require("./game");
var games = new game.GameManager;
/* chat hacks */
var users = [];
function extractClientData(socket) {
    var client = util.getCookie(socket.request.headers.cookie, util.cookiestring);
    if (client === undefined) {
        return { a: null, b: null };
    }
    var game = cookie2game[client];
    if (game === undefined) {
        return { a: null, b: null };
    }
    return { a: client, b: game };
}
/* create at post/create
   update at join */
var game2cookies = {};
/* create at io/use */
var cookie2socket = {};
/* create at io/join */
var cookie2game = {};
/* maintain at io/join */
var cookie2player = {};
/* create at post/create
   maintain at join */
var game2names = {};
var task = schedule.scheduleJob('42 * * * *', function () {
    for (var game_1 in game2cookies) {
        if (games.remove(game_1)) {
            for (var _i = 0, _a = game2cookies[game_1]; _i < _a.length; _i++) {
                var client = _a[_i];
                delete cookie2game[client];
                delete cookie2player[client];
            }
            delete game2cookies[game_1];
            delete game2names[game_1];
        }
    }
    return;
});
//TODO: admin stuffz, admin backdoors
exports.default = function (app, io) {
    app.post('/create', function (req, res) {
        if (req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
            return res.json({ "pass": false, "reason": "no recaptcha" });
        }
        var secretKey = "6LdX6UAUAAAAACSKbCPDc47NSkfjk-wY3Z6oAfO5";
        var verificationURL = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
        request(verificationURL, function (error, response, body) {
            body = JSON.parse(body);
            if (body.success !== undefined && !body.success) {
                return res.json({ "pass": false, "reason": "recaptcha failed" });
            }
            var gameId = util.randomString(10);
            games.createGame(gameId);
            game2cookies[gameId] = [];
            game2names[gameId] = ["Player 1", "Player 2", "Player 3", "Player 4", "Player 5", "Player 6"];
            res.json({ "pass": true, "code": gameId });
        });
    });
    io.use(function (socket, next) {
        var client = util.getCookie(socket.request.headers.cookie, util.cookiestring);
        if (client === undefined) {
            return;
        }
        cookie2socket[client] = socket.id;
        next();
    });
    io.on('connection', function (socket) {
        /* chat hacks */
        socket.on('setUsername', function (data) {
            console.log(data);
            if (users.indexOf(data) > -1) {
                socket.emit('userExists', data + ' username is taken! Try some other username.');
            }
            else {
                users.push(data);
                socket.emit('userSet', { username: data });
            }
        });
        socket.on('msg', function (data) {
            //Send message to everyone
            io.sockets.emit('newmsg', data);
        });
        socket.on('localMessage', function (string_data) {
            var _a = extractClientData(socket), client = _a.a, game = _a.b;
            if (game === undefined || game2cookies[game] === undefined)
                return;
            var player = cookie2player[client];
            var name = game2names[game][player];
            var data = JSON.parse(string_data);
            data.user = name;
            string_data = JSON.stringify(data);
            for (var _i = 0, _b = game2cookies[game]; _i < _b.length; _i++) {
                var client_1 = _b[_i];
                var socketid = cookie2socket[client_1];
                if (socketid === undefined)
                    continue;
                io.to(socketid).emit('localmessage', string_data);
            }
        });
        socket.on('declarealert', function (string_data) {
            var _a = extractClientData(socket), client = _a.a, game = _a.b;
            if (client == null || game == null || game2cookies[game] === undefined)
                return;
            var player = cookie2player[client];
            var name = game2names[game][player];
            for (var _i = 0, _b = game2cookies[game]; _i < _b.length; _i++) {
                var client_2 = _b[_i];
                var socketid = cookie2socket[client_2];
                if (socketid === undefined || player === undefined) {
                    continue;
                }
                var rdata = {
                    name: name
                };
                io.to(socketid).emit('declarealert', JSON.stringify(rdata));
            }
            return;
        });
        socket.on('join', function (string_data) {
            var data = JSON.parse(string_data);
            var client = util.getCookie(socket.request.headers.cookie, util.cookiestring);
            var game = data.game;
            var player = data.player;
            if (client === undefined || game === undefined
                || !games.gameExists(game)
                || util.checkNum(player, util.numPlayers)) {
                socket.emit('joinstatus', JSON.stringify({ success: false, reason: "invalid" }));
                return;
            }
            if (data.name === undefined) {
                data.name = "Player " + (player + 1);
            }
            var others = game2cookies[game];
            if (others.length >= util.numPlayers || others.indexOf(client) > -1) {
                socket.emit('joinstatus', JSON.stringify({ success: false, reason: "already joined" }));
                return;
            }
            for (var other in game2cookies[game]) {
                if (cookie2player[other] === player) {
                    socket.emit('joinstatus', JSON.stringify({ success: false }));
                    return;
                }
            }
            /* cannot join game if same name */
            for (var i = 0; i < 6; ++i) {
                if (i == player)
                    continue;
                if (game2names[game][i] == data.name) {
                    socket.emit('joinstatus', JSON.stringify({ success: false }));
                    return;
                }
            }
            /* remove client if they are already in a game */
            if (cookie2game[client] !== undefined) {
                var curGame = cookie2game[client];
                var curGameOthers = game2cookies[curGame];
                var newothers = [];
                for (var _i = 0, curGameOthers_1 = curGameOthers; _i < curGameOthers_1.length; _i++) {
                    var other = curGameOthers_1[_i];
                    if (other != client)
                        newothers.push(other);
                }
                game2cookies[curGame] = newothers;
            }
            others.push(client);
            game2cookies[data.game] = others;
            cookie2game[client] = game;
            cookie2player[client] = player;
            game2names[data.game][player] = data.name;
            socket.emit('joinstatus', JSON.stringify({ success: true }));
            return;
        });
        socket.on('watch', function (string_data) {
            var data = JSON.parse(string_data);
            var game = data.game;
            var player = data.player;
            if (game === undefined || !games.gameExists(game)
                || util.checkNum(player, util.numPlayers)) {
                socket.emit('joinstatus', JSON.stringify({ success: false, reason: "invalid" }));
                return;
            }
            var clients = game2cookies[game];
            for (var _i = 0, clients_1 = clients; _i < clients_1.length; _i++) {
                var client = clients_1[_i];
                if (cookie2player[client] == player) {
                    var socketid = cookie2socket[client];
                    //may leave the socket in multiple rooms
                    //will need to refresh to way someone new
                    socket.join(socketid);
                    return;
                }
            }
            return;
        });
        socket.on('makemove', function (string_data) {
            var data = JSON.parse(string_data);
            var _a = extractClientData(socket), client = _a.a, game = _a.b;
            if (client == null || game == null
                || cookie2player[client] === undefined) {
                socket.emit('makemovestatus', JSON.stringify({ success: false }));
                return;
            }
            var player = cookie2player[client];
            games.update(game, player, data);
            //do stuffz here
            for (var _i = 0, _b = game2cookies[game]; _i < _b.length; _i++) {
                var client_3 = _b[_i];
                var socketid = cookie2socket[client_3];
                var player_1 = cookie2player[client_3];
                if (socketid === undefined || player_1 === undefined) {
                    continue;
                }
                var rdata = {
                    gameCode: game,
                    data: games.getData(game, player_1),
                    player: player_1,
                    names: game2names[game]
                };
                io.to(socketid).emit('gamestate', JSON.stringify(rdata));
            }
            socket.emit('makemovestatus', JSON.stringify({ success: true }));
            return;
        });
        socket.on('gamestate', function (should_not_need_to_use_this) {
            var _a = extractClientData(socket), client = _a.a, game = _a.b;
            if (client == null || game == null
                || cookie2player[client] === undefined) {
                socket.emit('gamestatestatus', JSON.stringify({ success: false }));
                return;
            }
            var player = cookie2player[client];
            if (player === undefined) {
                socket.emit('gamestatestatus', JSON.stringify({ success: false }));
                return;
            }
            var rdata = {
                gameCode: game,
                data: games.getData(game, player),
                player: player,
                names: game2names[game]
            };
            socket.emit('gamestate', JSON.stringify(rdata));
            socket.emit('gamestatestatus', JSON.stringify({ success: true }));
            return;
        });
    });
};
//# sourceMappingURL=logic.js.map