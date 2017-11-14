import express = require('express');
import {Express, NextFunction, Request, Response} from 'express';
import {getLogger} from 'log4js';
import compression = require('compression');
import bind from 'bind-decorator';
import {ISiteManifest} from './build/site-manifest';
import mustacheExpress = require('mustache-express');

const log = getLogger();
log.level = 'debug';

const app: Express = express();
app.engine('html', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname);
const PORT = process.env.PORT || process.env.NODE_PORT || 9000;

interface SiteIndex {[domain: string]: ISiteManifest; }

class SiteRouter {
    private siteIndex: SiteIndex;

    constructor() {
        this.siteIndex = require('./dist/siteIndex.json');
    }

    @bind
    public pathRoute(path) {
        return (req: Request, res: Response, next: NextFunction) => {
            const site = this.siteIndex[req.hostname].name;
            if (!site) {
                res.status(400).send({message: `Host ${req.hostname} is not configured on this server`, status: 400});
            } else {
                express.static(`dist/${site}/${path}`)(req, res, next);
            }
        };
    }

    @bind
    public routeJSBundle(req: Request, res: Response) {
        const site = this.siteIndex[req.hostname];
        if (site.isStatic === true) {
            res.sendFile(`${process.cwd()}/dist/static/bundle.js`);
        } else {
            res.sendFile(`${process.cwd()}/dist/${site.name}/bundle.js`);
        }
    }

    public getSite(req: Request) {
        return this.siteIndex[req.hostname];
    }

    public getIndex() {
        return this.siteIndex;
    }
}

const router = new SiteRouter();

app.use(compression());
app.use('/assets', router.pathRoute('assets'));
app.use('/res', router.pathRoute(''));
app.use('/static', express.static('dist/static'));
app.use('/bundle.js', router.routeJSBundle);

app.all('*/', function sendIndex(req, res) {
    res.render('./index.html', router.getSite(req));
});

log.info(`Start Express Server on ${PORT}: v3`);
app.listen(PORT);
