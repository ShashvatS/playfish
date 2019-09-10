require('dotenv').config();

import debug = require('debug');
import express = require('express');
import path = require('path');

import http = require('http');
import sio = require('socket.io');

import routes from './routes/index';
import users from './routes/user';
import logic from './logic';

import bodyParser = require('body-parser');
import cookieParser = require('cookie-parser');

const app: express.Application = express();
const server: http.Server = http.createServer(app);
const io: SocketIO.Server = sio(server);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.enable('trust proxy');
if (process.env.NODE_ENV === "production") {
    app.use((req: express.Request, res: express.Response, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            res.redirect('https://' + req.header('host') + req.url);
        }
        else next();
    });
}

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use('/', routes);
app.use('/users', users);
logic(app, io);

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
    app.use((err: any, req, res, next) => {
        res.status(err['status'] || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use((err: any, req, res, next) => {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', process.env.PORT);

server.listen(app.get('port'), () => {
    debug('Express server listening on port ' + server.address().port);
});
