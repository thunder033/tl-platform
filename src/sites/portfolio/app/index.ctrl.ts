import {inject, ngAnnotate} from 'lib/injector-plus';
import {ADT} from './adt';
import {DT as PDT} from '@tree';
import {ExperienceService} from './experience-data.service';
import {IExperience} from './experience';
import {Logger} from 'core/log';
import {IController} from 'angular';
import {SkillsService} from './skills.service';

class PortfolioCtrl implements IController {
    private entries: IExperience[];
    private skillsList: string[];

    constructor(
        @inject(ADT.experienceData) private experience: ExperienceService,
        @inject(ADT.skills) private skills: SkillsService,
        @inject(PDT.core.log) private logger: Logger,
    ) {
        this.logger.info('Running Portfolio Ctrl');
        this.experience.getEntries().then((entries) => {
            this.entries = entries;
            return this.skills.getList();
        }).then((skillsList) => {
            this.skillsList = skillsList;
        });
    }

    public getExperienceByType(type: string) {
        if (!(this.entries instanceof Array)) {
            return [];
        }

        return this.entries.filter((entry: IExperience) => entry.type === type);
    }
}

module.exports = ngAnnotate(PortfolioCtrl);
