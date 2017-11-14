// import 'core-js/shim'; // TODO: enable this for production, but its big so don't need it now
import * as angular from 'angular';
import {DT} from '@tree';
import {StateProvider, UrlService} from '@uirouter/angularjs';
import {ILocationProvider} from 'angular';
import {inject, ngAnnotate} from 'lib/injector-plus';
import {Level, Logger} from 'core/log';

/**
 * Angular will properly new the constructor of provided "run" or "configure" class,
 * so we can inject dependencies without resorting to more complicated hacks. This
 * isn't documented behavior
 */
class Configure {
    constructor(
        @inject(DT.ng.$stateProvider) $stateProvider: StateProvider,
        @inject(DT.ng.$locationProvider) $locationProvider: ILocationProvider) {

        $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix('');
    }
}

class Run {
    constructor(@inject(DT.ng.$urlService) $urlService: UrlService,
                @inject(DT.core.log) log: Logger) {
        log.info('running app: v4');
        log.config({level: Level.Debug});
        $urlService.rules.initial('/index');
    }
}

const uiRouterExport = 'default'; // contains "requireable" module name
const platform = angular.module('tl-platform', [
    require('@uirouter/angularjs')[uiRouterExport],
])
    .config(ngAnnotate(Configure))
    .run(ngAnnotate(Run));

platform.provider(DT.config.site, require('core/site-config'));
platform.service(DT.core.log, require('core/log'));
platform.service(DT.core.data.templates, require('core/templates.data'));

module.exports = 'tl-platform';
