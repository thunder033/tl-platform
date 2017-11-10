import {IController} from 'angular';
import {inject, ngAnnotate} from 'lib/injector-plus';
import {DT} from '@tree';
import {StateService} from '@uirouter/angularjs';
import {Logger} from './log';

class StaticCtrl implements IController {
    constructor(
        @inject(DT.ng.$state) private $state: StateService,
        @inject(DT.core.log) private logger: Logger) {
        logger.debug('running static Ctrl');
    }

    public getState() {
        return 'getting state...';
        // return this.$state.$current.name || 'no state name...';
    }
}

module.exports = ngAnnotate(StaticCtrl);
