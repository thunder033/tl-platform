import angular = require('angular');
import {DT as PDT} from '@tree';
import {inject, ngAnnotate} from 'lib/injector-plus';
import {StateProvider} from '@uirouter/angularjs';

class Configure {
    constructor(@inject(PDT.ng.$stateProvider) $stateProvider: StateProvider) {
        /* The TL site builder will replace this with state definition statements. You can highlight
        these replacement comments in WebStorm adding the "TODO" pattern: \[.*\] specifying colors
        of your choosing */
        /*[StateDefinitions]*/
    }
}

const manifest = require('./manifest.json');
const app = angular.module(manifest.name, [
    require('core/tl-platform.module'),
]).config(ngAnnotate(Configure));

/*[ProviderDefinitions]*/
