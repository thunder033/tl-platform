'use strict';
/**
 * @author Greg Rozmarynowycz <greg@thunderlab.net>
 */
// read in and transpile the gulpclass task runner
// https://github.com/pleerock/gulpclass
eval(require('typescript').transpile(require('fs').readFileSync('./gulpclass.ts').toString()));