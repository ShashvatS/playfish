export const numCards: number = 54;
export const numSets: number = 9;
export const cardsPerSet: number = 6;
export const numPlayers: number = 6;

export const cookiestring: string = "clientid";

export function randomString(length: number): string {
    var str: string = '';
    var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (var i = length; i > 0; --i) str += chars[Math.floor(Math.random() * chars.length)];
    return str;
}

export function shuffle(array): number[] {
    var currentIndex = array.length,
        temporaryValue, randomIndex;

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

/**
 * should return undefined if cookie doesn't exist?
 * @param cookie entire cookie
 * @param name name of field to be extracted
 */
export function getCookie(cookie: string, name: string) {
    var value = "; " + cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop().split(";").shift();
}

export function checkNum(num: any, upper: number) {
    return (num === undefined || isNaN(num) || num < 0 || num >= upper);
}