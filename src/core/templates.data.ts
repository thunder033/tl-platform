
import {inject, ngAnnotate} from 'lib/injector-plus';
import {DT} from '@tree';
import {IDeferred, IPromise, IQService} from 'angular';

export class TemplatesService {
    private templatesUrl = 'res/views.json';
    private templates = null;
    private ready: IDeferred<any>;
    
    constructor(@inject(DT.ng.$http) $http, @inject(DT.ng.$q) private $q: IQService) {
        this.ready = $q.defer();
        $http.get(this.templatesUrl).then((resp) => {
            this.templates = resp.data;
            this.ready.resolve(true);
        }).catch(this.ready.reject);
    }
    
    public getTemplates(): IPromise<any> {
        return this.ready.promise.then(() => {
            return this.templates;
        }).catch(() => {
            return this.$q.reject('Template loading failed');
        });
    } 
}

module.exports = ngAnnotate(TemplatesService);
