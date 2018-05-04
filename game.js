"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util = require("./util");
/* Player 0 always starts */
var Game = (function () {
    function Game() {
        this.scoreOdd = 0;
        this.scoreEven = 0;
        this.lastPlayer = 0;
        this.moves = [];
        this.time = Date.now();
        this.declares = [];
        this.declaresLog = [];
        for (var i = 0; i < util.numSets; ++i) {
            this.declares.push(-1);
        }
        this.numCards = [];
        this.numCardsBySet = [];
        for (var i = 0; i < util.numPlayers; ++i) {
            this.numCards.push(9);
            this.numCardsBySet.push([]);
            for (var j = 0; j < util.numSets; ++j) {
                this.numCardsBySet[i].push(0);
            }
        }
        this.cards = Array.apply(null, Array(util.numCards)).map(function (x, i) {
            return Math.floor(i * util.numPlayers / (util.numCards));
        });
        util.shuffle(this.cards);
        for (var i = 0; i < util.numCards; ++i) {
            var player = this.cards[i];
            var card = i % util.cardsPerSet;
            var set = (i - card) / util.cardsPerSet;
            this.numCardsBySet[player][set] += 1;
        }
    }
    ;
    Game.prototype.update = function (player, data) {
        if (data.type === undefined) {
            return;
        }
        else if (data.type === "ask") {
            /*
            (1) Must be the players turn
            (2) data must be within range
            (3) must have a card in the set
            (4) the player they are asking must be on the other team
            (5) the player they are asking must have some cards
            */
            // (1) (2) (4)
            if (this.lastPlayer != player
                || util.checkNum(data.other, util.numPlayers)
                || util.checkNum(data.card, util.numCards)
                || player % 2 == data.other % 2) {
                return;
            }
            var card = data.card % util.cardsPerSet;
            var set = (data.card - card) / util.cardsPerSet;
            // (5)
            if (this.numCards[data.other] == 0)
                return;
            else if (this.numCardsBySet[player][set] == 0)
                return;
            /*  transfer the card */
            if (this.cards[data.card] == data.other) {
                this.cards[data.card] = player;
                this.moves.push([player, data.other, data.card, 1]);
                this.numCards[player] += 1;
                this.numCardsBySet[player][set] += 1;
                this.numCards[data.other] -= 1;
                this.numCardsBySet[data.other][set] -= 1;
            }
            else {
                this.lastPlayer = data.other;
                this.moves.push([player, data.other, data.card, 0]);
            }
            return;
        }
        else if (data.type === "declare") {
            // check that the set is valid and hasnt already been declared
            if (util.checkNum(data.set, util.numSets)
                || this.declares[data.set] != -1) {
                return;
            }
            for (var i = 0; i < util.cardsPerSet; ++i) {
                if (util.checkNum(data[i], util.numPlayers)
                    || (+data[i] % 2) != (player % 2))
                    return;
            }
            var success = true;
            for (var i = 0; i < util.cardsPerSet; ++i) {
                var card = data.set * util.cardsPerSet + i;
                if (this.cards[card] != data[i]) {
                    success = false;
                    break;
                }
            }
            if (success) {
                if (player % 2) {
                    ++this.scoreOdd;
                    this.declares[data.set] = 3;
                }
                else {
                    ++this.scoreEven;
                    this.declares[data.set] = 2;
                }
            }
            else {
                if (player % 2) {
                    ++this.scoreEven;
                    this.declares[data.set] = 1;
                }
                else {
                    ++this.scoreOdd;
                    this.declares[data.set] = 0;
                }
            }
            this.declaresLog.push(data.set);
            for (var i = 0; i < util.numPlayers; ++i) {
                this.numCards[i] -= this.numCardsBySet[i][data.set];
                this.numCardsBySet[i][data.set] = 0;
            }
            for (var i = 0; i < util.cardsPerSet; ++i) {
                var card = data.set * util.cardsPerSet + i;
                this.cards[card] = -1;
            }
        }
        else if (data.type === "transfer") {
            if (util.checkNum(data.other, util.numPlayers)
                || data.other % 2 != player % 2
                || this.numCards[player] != 0
                || this.lastPlayer != player) {
                return;
            }
            this.lastPlayer = data.other;
        }
        return;
    };
    Game.prototype.data = function (player) {
        var playerCards = [];
        for (var i = 0; i < util.numCards; ++i) {
            if (this.cards[i] == player) {
                playerCards.push(i);
            }
        }
        var lastMove;
        if (this.moves.length == null)
            lastMove = null;
        else {
            lastMove = this.moves[this.moves.length - 1];
        }
        return {
            cards: playerCards,
            lastMove: lastMove,
            scoreOdd: this.scoreOdd,
            scoreEven: this.scoreEven,
            turn: this.lastPlayer,
            numCards: this.numCards,
            declares: this.declares,
            declaresLog: this.declaresLog
        };
    };
    return Game;
}());
var GameManager = (function () {
    function GameManager() {
        this.games = {};
    }
    ;
    GameManager.prototype.remove = function (key) {
        if (this.games[key].time - Date.now() > 24 * 60 * 60 * 1000) {
            delete this.games[key];
            return true;
        }
        return false;
    };
    GameManager.prototype.removeOld = function () {
        for (var key in this.games) {
            if (this.games[key].time - Date.now() > 24 * 60 * 60 * 1000) {
                delete this.games[key];
            }
        }
    };
    GameManager.prototype.createGame = function (gameId) {
        this.games[gameId] = new Game();
    };
    GameManager.prototype.gameExists = function (gameId) {
        return this.games[gameId] !== undefined;
    };
    /**
     * assumes correctness of gameId and data.player
     * but NOT the rest of data
     * @param gameId
     * @param data
     */
    GameManager.prototype.update = function (gameId, player, data) {
        this.games[gameId].update(player, data);
    };
    /**
     * assumes correctness of gameId and player
     * @param gameId
     * @param player
     */
    GameManager.prototype.getData = function (gameId, player) {
        return this.games[gameId].data(player);
    };
    return GameManager;
}());
exports.GameManager = GameManager;
//# sourceMappingURL=game.js.map