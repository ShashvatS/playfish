import express = require('express');
import request = require('request');
import sio = require('socket.io');

import schedule = require('node-schedule');

import * as util from './util';
import * as game from './game';

const games: game.GameManager = new game.GameManager;

/* chat hacks */
const users: string[] = [];

function extractClientData(socket: SocketIO.Socket) {
    const client = util.getCookie(socket.request.headers.cookie,
        util.cookiestring);
    if (client === undefined) {
        return { a: null, b: null };
    }

    const game = cookie2game[client];
    if (game === undefined) {
        return { a: null, b: null };
    }

    return { a: client, b: game };
}

/* create at post/create
   update at join */
const game2cookies: { [game: string]: string[] } = {};
/* create at io/use */
const cookie2socket: { [cookie: string]: string } = {};
/* create at io/join */
const cookie2game: { [cookie: string]: string } = {}
/* maintain at io/join */
const cookie2player: { [cookie: string]: number } = {};

const task = schedule.scheduleJob('42 * * * *', () => {
    for (let game in game2cookies) {
        if (games.remove(game)) {
            for (let client of game2cookies[game]) {
                delete cookie2game[client];
                delete cookie2player[client];
            }
            delete game2cookies[game];
        }
    }

    return;
});

//TODO: admin stuffz, admin backdoors
export default (app: express.Application, io: SocketIO.Server) => {
    app.post('/create', (req: express.Request, res: express.Response) => {
        if (req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
            return res.json({ "pass": false, "reason": "no recaptcha" });
        }
        const secretKey = "6LdX6UAUAAAAACSKbCPDc47NSkfjk-wY3Z6oAfO5";
        const verificationURL = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;

        request(verificationURL, (error, response, body) => {
            body = JSON.parse(body);

            if (body.success !== undefined && !body.success) {
                return res.json({ "pass": false, "reason": "recaptcha failed" });
            }

            const gameId: string = util.randomString(10);
            games.createGame(gameId);
            game2cookies[gameId] = [];
            res.json({ "pass": true, "code": gameId });
        });
    });

    io.use((socket: SocketIO.Socket, next) => {
        const client = util.getCookie(socket.request.headers.cookie,
            util.cookiestring);
        if (client === undefined) {
            return;
        }
        cookie2socket[client] = socket.id;

        next();
    });
    io.on('connection', (socket: SocketIO.Socket) => {
        /* chat hacks */
        socket.on('setUsername', function (data) {
            console.log(data);

            if (users.indexOf(data) > -1) {
                socket.emit('userExists', data + ' username is taken! Try some other username.');
            } else {
                users.push(data);
                socket.emit('userSet', { username: data });
            }
        });
        socket.on('msg', function (data) {
            //Send message to everyone
            io.sockets.emit('newmsg', data);
        });

        socket.on('localMessage', (string_data) => {
            const { a: client, b: game } = extractClientData(socket);

            if (game === undefined || game2cookies[game] === undefined)
                return;

            for (let client of game2cookies[game]) {
                const socketid = cookie2socket[client];
                if (socketid === undefined) continue;
                io.to(socketid).emit('localmessage', string_data);
            }

        });

        socket.on('join', (string_data) => {
            const data = JSON.parse(string_data);
            const client = util.getCookie(socket.request.headers.cookie,
                util.cookiestring);

            const game = data.game;
            const player = data.player;
            if (client === undefined || game === undefined
                || !games.gameExists(game)
                || util.checkNum(player, util.numPlayers)) {
                socket.emit('joinstatus', JSON.stringify({ success: false, reason: "invalid" }));
                return;
            }

            const others = game2cookies[game];

            if (others.length >= util.numPlayers || others.indexOf(client) > -1) {
                socket.emit('joinstatus', JSON.stringify({ success: false, reason: "already joined" }));
                return;
            }

            for (let other in game2cookies[game]) {
                if (cookie2player[other] === player) {
                    socket.emit('joinstatus', JSON.stringify({ success: false }));
                    return;
                }
            }

            /* remove client if they are already in a game */
            if (cookie2game[client] !== undefined) {
                const curGame = cookie2game[client];
                const curGameOthers = game2cookies[curGame];
                const newothers: string[] = [];
                for (let other of curGameOthers) {
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
        socket.on('makemove', (string_data) => {
            const data = JSON.parse(string_data);
            const { a: client, b: game } = extractClientData(socket);
            
            if (client == null || game == null
                || cookie2player[client] === undefined) {
                socket.emit('makemovestatus', JSON.stringify({ success: false }));
                return;
            }
            const player = cookie2player[client];

            games.update(game, player, data);
            //do stuffz here
            for (let client of game2cookies[game]) {
                const socketid = cookie2socket[client];
                const player = cookie2player[client];

                if (socketid === undefined || player === undefined) {
                    continue;
                }

                const rdata = {
                    gameCode: game,
                    data: games.getData(game, player),
                    player: player
                };

                io.to(socketid).emit('gamestate', JSON.stringify(rdata));
            }

            socket.emit('makemovestatus', JSON.stringify({ success: true }));
            return;
        });

        socket.on('gamestate', (should_not_need_to_use_this) => {
            const { a: client, b: game } = extractClientData(socket);
            if (client == null || game == null
                || cookie2player[client] === undefined) {
                socket.emit('gamestatestatus', JSON.stringify({ success: false }));
                return;
            }
            const player = cookie2player[client];
            if (player === undefined) {
                socket.emit('gamestatestatus', JSON.stringify({ success: false }));
                return;
            }
            const rdata = {
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