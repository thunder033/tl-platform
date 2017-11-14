
import {inject, ngAnnotate} from 'lib/injector-plus';
import {DT} from '@tree';
import {Ng1StateDeclaration, StateProvider} from '@uirouter/angularjs';
import {SiteParameters} from './core/site-config';
import * as angular from 'angular';

class SiteLoader {
    constructor(
        @inject(DT.ng.$stateProvider) private $stateProvider: StateProvider) {
   }
}

abstract class Site {
    
    protected host: string;
    protected name: string;

    protected module;

    constructor(params: SiteParameters) {
        this.host = params.host;
        this.name = params.name;

        this.module = angular.module(this.name, [
            require('core/tl-platform.module'),
        ]);
    }

    public getHost() {
        return this.host;
    }

    public getName() {
        return this.name;
    }
}
