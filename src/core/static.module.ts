import angular = require('angular');
import {DT as PDT} from '@tree';
import {inject, ngAnnotate} from 'lib/injector-plus';
import { StateProvider} from '@uirouter/angularjs';

class Configure {
    constructor(@inject(PDT.ng.$stateProvider) $stateProvider: StateProvider) {
        $stateProvider.state('view', {
            controller: PDT.core.staticCtrl,
            templateProvider: require('core/static-template-provider'),
            url: '/:view',
        });
    }
}

/**
 * This angular app provides routing for static sites
 * @type {angular.IModule}
 */
const staticSite = angular.module('tl-platform.static', [
    require('core/tl-platform.module'),
]).config(ngAnnotate(Configure));

staticSite.controller(PDT.core.staticCtrl, require('core/static.ctrl'));
