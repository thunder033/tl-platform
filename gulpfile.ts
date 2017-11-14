#!/usr/bin/env node
import {Gulpclass, SequenceTask, Task} from 'gulpclass';
import del = require('del');
import sourcemaps = require('gulp-sourcemaps');
import gulp = require('gulp');
import es = require('event-stream');
import * as fs from 'fs';
import * as path from 'path';
import cleanCSS = require('gulp-clean-css');
import concat = require('gulp-concat');
import {ISiteManifest} from './build/site-manifest';
import {ITaskRunner} from './build/task-runner';
import {SitePrecompiler} from './build/site-precompiler';
import {Config} from './build/config';
import {BrowserifyObject} from 'browserify';
import {Bundler} from './build/browserify-factory';
import gutil = require('gulp-util');
import {setAliases} from './build/configure-aliases';

/* CONFIG */
setAliases();
const argv = require('yargs').argv;

function addSiteEntry(index: any, manifest: ISiteManifest) {
    let [domainName, domain] = manifest.host.split('.');
    if (process.env.NODE_ENV !== 'production') {
        domain = 'test';
    }

    index[`${domainName}.${domain}`] = manifest;
}

@Gulpclass()
export class Gulpfile implements ITaskRunner {

    @Task('copy-site-assets')
    public copySiteAssets(siteDir: string) {
        const assetsSrc = path.join(Config.location.sites, siteDir, Config.location.assets);
        const assetsDest = path.join(Config.location.dist, siteDir, Config.location.assets);
        return gulp.src(`${assetsSrc}/**/*`)
            .pipe(gulp.dest(assetsDest));
    }

    @Task('minify-site-css')
    public minifySiteCSS(siteDir: string) {
        const sitePath = path.join(Config.location.sites, siteDir);
        return gulp.src(`${sitePath}/*.css`)
            .pipe(sourcemaps.init())
            .pipe(cleanCSS())
            .pipe(concat('style.min.css'))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(path.join(Config.location.dist, siteDir)));
    }

    @Task('compile-sites')
    public async compileSites() {
        const sites = fs.readdirSync(Config.location.sites);
        const index = {}; // create site index for server

        const tasks = sites.map((siteName) => this.compileSite(siteName, index));

        return Promise.all(tasks).then((streams) => {
            fs.writeFileSync(Config.paths.siteIndex, JSON.stringify(index), {encoding: 'utf-8'});
            return es.merge.apply(null, streams);
        });
    }

    @Task('compile-site')
    public compileSiteWrapper() {
        return this.compileSite(); // run the function with default args, gulp sends in a cb func by default
    }

    public compileSite(siteName: string = argv.site, siteIndex = require(Config.paths.siteIndex)) {
        gutil.log(`Begin compiling ${siteName}`);
        const precompiler = SitePrecompiler.load(siteName);
        return precompiler.prepare().then((bundler: BrowserifyObject) => {
            const manifest: ISiteManifest = precompiler.getManifest();

            addSiteEntry(siteIndex, manifest);

            // even though views will be template-replaced in module files, write the file for flexibility (and static sites)
            const siteOut = path.join(Config.location.dist, manifest.name);
            fs.writeFileSync(
                path.join(siteOut, Config.file.viewsBundle),
                JSON.stringify(precompiler.getViews()),
                {encoding: 'utf-8'});

            const siteTasks = [
                Bundler.doBundle(bundler, Config.file.distJs, siteOut),
                this.minifySiteCSS(siteName),
                this.copySiteAssets(siteName),
            ];

            return es.merge.apply(null, siteTasks);
        });
    }

    @Task('browserify-static')
    public browserify() {
        const files = {[Config.file.distJs]: 'src/core/static.module.js'};
        const streams = Object.keys(files).map((outputFile) => {
            const browserifyObject: BrowserifyObject = Bundler.buildBrowserify(files[outputFile]);
            return Bundler.doBundle(browserifyObject, outputFile, Config.location.staticDist);
        });

        return es.merge.apply(null, streams);
    }

    @SequenceTask()
    public 'build-dev'() { return ['clean-dist', 'browserify-static', 'compile-sites']; }

    @SequenceTask()
    public 'clean-all'() { return ['clean-dist', 'clean-tmp']; }

    @Task('clean-dist')
    public cleanDist() {
        return del([`${Config.location.dist}*`]);
    }

    @Task('clean-tmp')
    public cleanTmp() {
        return del(['.tmp/*']);
    }
}
