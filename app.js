"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
var debug = require("debug");
var express = require("express");
var path = require("path");
var http = require("http");
var sio = require("socket.io");
var index_1 = require("./routes/index");
var user_1 = require("./routes/user");
var logic_1 = require("./logic");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var app = express();
var server = http.createServer(app);
var io = sio(server);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.enable('trust proxy');
if (process.env.NODE_ENV === "production") {
    app.use(function (req, res, next) {
        if (req.header('x-forwarded-proto') !== 'https') {
            res.redirect('https://' + req.header('host') + req.url);
        }
        else
            next();
    });
}
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/', index_1.default);
app.use('/users', user_1.default);
logic_1.default(app, io);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err['status'] = 404;
    next(err);
});
// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err['status'] || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
else {
    // production error handler
    // no stacktraces leaked to user
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });
}
app.set('port', process.env.PORT);
server.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address());
});
//# sourceMappingURL=app.js.map