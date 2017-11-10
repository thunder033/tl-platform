import { StateParams } from '@uirouter/angularjs';
import {inject, InjectableMethod, ngAnnotate} from 'lib/injector-plus';
import {DT} from '@tree';
import {Logger} from './log';

class StaticTemplateProvider implements InjectableMethod {
    public exec(
        @inject(DT.core.log) logger: Logger,
        @inject(DT.ng.$stateParams) $stateParams: StateParams,
        @inject(DT.ng.$http) $http) {
        const viewsPath = 'res/views.json';
        return $http.get(viewsPath).then((resp) => {
            logger.info(`loading view for ${$stateParams.view}`);
            logger.debug(resp);
            return resp.data[`${$stateParams.view}.html`];
        });

    }
}

module.exports = ngAnnotate(StaticTemplateProvider);
