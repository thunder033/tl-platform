import {inject, InjectableMethod, ngAnnotate} from 'lib/injector-plus';
import {DT} from '@tree';
import {Logger} from './log';
import {TemplatesService} from './templates.data';

class TemplateProvider implements InjectableMethod {
    public exec(
        @inject(DT.core.log) logger: Logger,
        @inject(DT.core.data.templates) templatesService: TemplatesService) {
        return (viewName: string) => {
            return templatesService.getTemplates().then((templates) => {
                return templates[viewName];
            });
        };
    }
}

module.exports = ngAnnotate(TemplateProvider);
