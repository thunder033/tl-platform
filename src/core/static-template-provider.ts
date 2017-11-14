import { StateParams, StateService } from '@uirouter/angularjs';
import {inject, InjectableMethod, ngAnnotate} from 'lib/injector-plus';
import {DT} from '@tree';
import {Logger} from './log';
import {TemplatesService} from './templates.data';

class StaticTemplateProvider implements InjectableMethod {
    public exec(
        @inject(DT.core.log) logger: Logger,
        @inject(DT.ng.$stateParams) $stateParams: StateParams,
        @inject(DT.ng.$state) $state: StateService,
        @inject(DT.core.data.templates) templatesService: TemplatesService) {
        return templatesService.getTemplates().then((templates) => {
            const viewName = $stateParams.view || $state.current.name;
            logger.info($stateParams);
            logger.info($state);
            logger.info(`loading view for ${viewName}`);
            return templates[`${viewName}.html`];
        });
    }
}

module.exports = ngAnnotate(StaticTemplateProvider);
