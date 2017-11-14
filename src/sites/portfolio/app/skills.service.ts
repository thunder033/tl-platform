
import {inject, ngAnnotate} from 'lib/injector-plus';
import {ADT} from './adt';
import {ExperienceService} from './experience-data.service';
import {DT} from '@tree';
import {IPromise, IQService} from 'angular';
import {lowerCase} from 'change-case';

export class SkillsService {
    private skills: string[];

    constructor(
        @inject(DT.ng.$q) private $q: IQService,
        @inject(ADT.experienceData) private experienceData: ExperienceService) {
    }

    public getList(): IPromise<string[]> {
        if (this.skills) {
            return this.$q.when(this.skills);
        }

        return this.experienceData.getEntries().then((entries) => {
            this.skills = entries.reduce((skills, experience) => {
                if (!(experience.skills instanceof Array)) {
                    return skills;
                }

                const newSkills = experience.skills
                    .map((skill) => lowerCase(skill))
                    .filter((skill) => skills.indexOf(skill) === -1);
                return Array.prototype.concat.apply(skills, newSkills);
            }, []);

            return this.skills;
        });
    }
}

module.exports = ngAnnotate(SkillsService);
