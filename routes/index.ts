﻿/*
 * GET main pages
 */
import express = require('express');
import path = require('path');
import uuid4 = require('uuid/v4');
import * as util from '../util';

const router = express.Router();

router.get('/*', (req: express.Request, res: express.Response, next) => {
    if (req.cookies.clientid === undefined) {
        res.cookie(util.cookiestring, uuid4());
    }
    next();
});

router.get('/', (req: express.Request, res: express.Response) => {
    res.sendFile(path.join(__dirname, '../views/index.html'));
});

router.get('/create', (req: express.Request, res: express.Response) => {
    res.sendFile(path.join(__dirname, '../views/create.html'));
});

router.get('/join', (req: express.Request, res: express.Response) => {
    res.sendFile(path.join(__dirname, '../views/join.html'));
});

router.get('/chat', (req: express.Request, res: express.Response) => {
    res.sendFile(path.join(__dirname, '../views/chat.html'));
});

export default router;