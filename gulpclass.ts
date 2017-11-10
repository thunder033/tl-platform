import {Gulpclass, SequenceTask, Task} from 'gulpclass';
import del = require('del');
import browserify = require('browserify');
import buffer = require('vinyl-buffer');
import source = require('vinyl-source-stream');
import sourcemaps = require('gulp-sourcemaps');
import gutil = require('gulp-util');
import gulp = require('gulp');
import es = require('event-stream');
import * as fs from 'fs';
import * as path from 'path';
import cleanCSS = require('gulp-clean-css');
import concat = require('gulp-concat');

const location = {
    dist: './dist',
    sites: 'src/sites',
    src: './src',
    staticDist: './dist/static',
    tmp: './.tmp',
    assets: 'assets',
};

@Gulpclass()
export class Gulpfile {

    @Task('copy-site-assets')
    public copySiteAssets(siteDir: string) {
        const assetsSrc = path.join(location.sites, siteDir, location.assets);
        const assetsDest = path.join(location.dist, siteDir, location.assets);
        return gulp.src(`${assetsSrc}/**/*`)
            .pipe(gulp.dest(assetsDest));
    }

    @Task('minify-site-css')
    public minifySiteCSS(siteDir: string) {
        const sitePath = path.join(location.sites, siteDir);
        return gulp.src(`${sitePath}/*.css`)
            .pipe(sourcemaps.init())
            .pipe(cleanCSS())
            .pipe(concat('style.min.css'))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(path.join(location.dist, siteDir)));
    }

    @Task('compile-sites')
    public compileSites() {
        const siteModule = 'site.module';
        const manifestFile = 'manifest.json';
        const sites = fs.readdirSync(location.sites);

        /**
         * Determines if the file name references a view type file
         * @param {string} fileName
         * @returns {boolean}
         */
        function isView(fileName: string): boolean {
            // Can add more file extensions to array to add more view types
            return ['html'].indexOf(fileName.split('.').pop()) > -1;
        }

        const tasks = sites.map((siteDir) => {
            const sitePath = path.join(location.sites, siteDir);
            // path.join normalizes paths and removes the "./" needed for local requires
            const manifest = require('./' + path.join(sitePath, manifestFile));

            const views = {};
            const siteFiles = fs.readdirSync(sitePath);
            siteFiles.filter(isView).forEach((viewFile) => {
                views[viewFile] = fs.readFileSync(path.join(sitePath, viewFile)).toString();
            });

            const siteOut = path.join(location.dist, manifest.name);
            try {
                fs.mkdirSync(siteOut);
            } catch (e) {
                if (e.code !== 'EEXIST') {
                    throw e;
                }
            }

            fs.writeFileSync(path.join(siteOut, 'views.json'), JSON.stringify(views), {encoding: 'utf-8'});
            return es.merge(this.minifySiteCSS(siteDir), this.copySiteAssets(siteDir));
        });

        return es.merge.apply(null, tasks);
    }

    @Task('browserify')
    public browserify() {
        const files = {
            'bundle.js': 'src/tl-platform.module.js',
        };

        const aliases = {
            '@tree': './src/dt.js',
            '@uirouter/angularjs': './node_modules/@uirouter/angularjs/release/angular-ui-router.min.js',
            'angular': './scripts/angular.min.proxy.js',
        };

        const streams = Object.keys(files).map((outputFile) => {
            const b = browserify({entries: [files[outputFile]], paths: [location.src]});

            // https://stackoverflow.com/questions/36613871/how-to-alias-a-module-with-browserify-lib-in-gulp
            Object.keys(aliases).forEach((alias) => {
                b.require(aliases[alias], {expose: alias});
            });

            return b.bundle()
                .pipe(source(outputFile))
                .pipe(buffer())
                .pipe(sourcemaps.init({loadMaps: true}))
                .on('error', gutil.log)
                .pipe(sourcemaps.write())
                .pipe(gulp.dest(location.staticDist));
        });

        return es.merge.apply(null, streams);
    }

    @SequenceTask()
    public 'build-dev'() { return ['clean-dist', 'browserify', 'compile-sites']; }

    @SequenceTask()
    public 'clean-all'() { return ['clean-dist', 'clean-tmp']; }

    @Task('clean-dist')
    public cleanDist() {
        return del([`${location.dist}*`]);
    }

    @Task('clean-tmp')
    public cleanTmp() {
        return del(['.tmp/*']);
    }
}
