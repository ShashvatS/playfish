"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.numCards = 54;
exports.numSets = 9;
exports.cardsPerSet = 6;
exports.numPlayers = 6;
exports.cookiestring = "clientid";
function randomString(length) {
    var str = '';
    var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (var i = length; i > 0; --i)
        str += chars[Math.floor(Math.random() * chars.length)];
    return str;
}
exports.randomString = randomString;
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}
exports.shuffle = shuffle;
/**
 * should return undefined if cookie doesn't exist?
 * @param cookie entire cookie
 * @param name name of field to be extracted
 */
function getCookie(cookie, name) {
    var value = "; " + cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2)
        return parts.pop().split(";").shift();
}
exports.getCookie = getCookie;
function checkNum(num, upper) {
    return (num === undefined || isNaN(num) || num < 0 || num >= upper);
}
exports.checkNum = checkNum;
//# sourceMappingURL=util.js.map