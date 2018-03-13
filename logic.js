"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request = require("request");
var util = require("./util");
var game = require("./game");
var games = new game.GameManager;
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
            socket.emit('joinstatus', JSON.stringify({ success: true }));
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
                var client_1 = _b[_i];
                console.log(client_1);
                var socketid = cookie2socket[client_1];
                var player_1 = cookie2player[client_1];
                if (socketid === undefined || player_1 === undefined) {
                    return;
                }
                var rdata = {
                    gameCode: game,
                    data: games.getData(game, player_1),
                    player: player_1
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
                player: player
            };
            socket.emit('gamestate', JSON.stringify(rdata));
            socket.emit('gamestatestatus', JSON.stringify({ success: true }));
            return;
        });
    });
};
//# sourceMappingURL=logic.js.map