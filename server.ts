import express = require('express');
import {Express} from 'express';
import {getLogger} from 'log4js';
import compression = require('compression');

const log = getLogger();
log.level = 'debug';

const app: Express = express();
const PORT = process.env.PORT || process.env.NODE_PORT || 9000;

class SiteRouter {
    public static pathRoute(path) {
        const site = 'thunderlab';
        return express.static(`dist/${site}/${path}`);
    }
}

app.use(compression());
app.use('/assets', SiteRouter.pathRoute('assets'));
app.use('/res', SiteRouter.pathRoute(''));
app.use('/static', express.static('dist/static'));

app.all('*/', function(req, res) {
    res.sendFile('index.html', { root: __dirname });
});

log.info(`Start Express Server on ${PORT}: v1`);
app.listen(PORT);
