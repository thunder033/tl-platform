import {inject, ngAnnotate} from 'lib/injector-plus';
import {DT as PDT} from '@tree';
import {IExperience} from './experience';
import {IPromise, IQService} from 'angular';

export class ExperienceService {
    private entries: IExperience[];
    
    constructor(@inject(PDT.ng.$q) private $q: IQService) {
        this.entries = require('./experience.json');
    }

    public getEntries(): IPromise<IExperience[]> {
        return this.$q.when(this.entries);
    }
}

module.exports = ngAnnotate(ExperienceService);
