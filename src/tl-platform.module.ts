// import 'core-js/shim';
import * as angular from 'angular';
import {DT} from '@tree';
import {Ng1StateDeclaration, StateProvider, UrlService} from '@uirouter/angularjs';
import {ILocationProvider} from 'angular';
import {inject, ngAnnotate} from 'lib/injector-plus';
import {Level, Logger} from './core/log';

class Configure {
    constructor(
        @inject(DT.ng.$stateProvider) $stateProvider: StateProvider,
        @inject(DT.ng.$locationProvider) $locationProvider: ILocationProvider,
        @inject(DT.value.states) states: Ng1StateDeclaration[]) {

        $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix('');

        if (states.length === 0) {
            $stateProvider.state('static', {
                controller: DT.core.staticCtrl,
                templateProvider: require('./core/static-template-provider'),
                url: '/:view',
            });
        }
    }
}

class Run {
    constructor(@inject(DT.ng.$urlService) $urlService: UrlService,
                @inject(DT.core.log) log: Logger) {
        log.info('running app: v2');
        log.config({level: Level.Debug});
        $urlService.rules.initial('/test');
    }
}

const platform = angular.module('tl-platform', [
    require('@uirouter/angularjs')['default'], // contains module name
])
    .constant(DT.value.states, [])
    .config(ngAnnotate(Configure))
    .run(ngAnnotate(Run));

platform.provider(DT.config.site, require('./core/site-config'));
platform.controller(DT.core.staticCtrl, require('./core/static.ctrl'));
platform.service(DT.core.log, require('./core/log'));

module.exports = 'tl-platform';
