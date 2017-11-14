
import {BrowserifyObject} from 'browserify';
import {Config} from './config';
import browserify = require('browserify');
import buffer = require('vinyl-buffer');
import source = require('vinyl-source-stream');
import sourcemaps = require('gulp-sourcemaps');
import gutil = require('gulp-util');
import gulp = require('gulp');

export class Bundler {
    public static buildBrowserify(srcFile): BrowserifyObject {
        // srcFile is the root module to bundle
        const browserifyObject = browserify({entries: [srcFile], ...Config.browserify.options});

        // https://stackoverflow.com/questions/36613871/how-to-alias-a-module-with-browserify-lib-in-gulp
        Object.keys(Config.browserify.aliases).forEach((alias) => {
            browserifyObject.require(Config.browserify.aliases[alias], {expose: alias});
        });

        return browserifyObject;
    }

    public static doBundle(browserifyObj: BrowserifyObject, outFile: string, dest: string): ReadableStream {
        return browserifyObj.bundle()
            .pipe(source(outFile))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .on('error', gutil.log)
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(dest));
    }
}
