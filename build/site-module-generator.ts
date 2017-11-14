import {ISiteManifest} from './site-manifest';
import * as fs from 'fs';
import {IViewMap, SiteView} from './site-view';
import {Config} from './config';
import * as readdir from 'recursive-readdir';
import * as path from 'path';
import {camelCase} from 'change-case';
import gutil = require('gulp-util');
import * as slash from 'slash';

/**
 * Builds a Angular site module from the app module template
 */
export class SiteModuleGenerator {
    private replacementPattern = /\/\*\[([a-zA-Z0-9_-]+)]\*\//g; // locate injection comments
    private stateProvider = '$stateProvider';
    private siteComponents: string[] = [];
    private sitePath: string;
    private siteTree: any = null;

    private static getProviderName(script: string): string {
        const pathSplitPattern = new RegExp(`app[\\\\\\/]`);
        const dashName = script.split(pathSplitPattern).pop().replace('.js', '');
        return camelCase(dashName.split('.').shift());
    }

    constructor(
        private readonly site: ISiteManifest,
        private readonly viewMap: IViewMap,
        private readonly moduleTemplate = fs.readFileSync(Config.siteModuleTemplate).toString()) {

        this.sitePath = path.join(Config.location.sites, this.site.name);
        if (this.site.dependencyTreePath) {
            this.siteTree = Config.rootRequire(path.join(this.sitePath, this.site.dependencyTreePath));
            // throw new Error('"dependencyTreePath" field must be defined in site manifest to generate app module');
        } else {
            gutil.log(`No dependency tree is configured for ${this.site.name}. No providers will be configured.`);
        }

    }

    public async build() {
        this.siteComponents = await this.readSiteScripts();
        const views: SiteView[] = Object.keys(this.viewMap).map((fileName: string) => {
            const name = fileName.split('.').shift();
            return new SiteView(this.site, name, this.viewMap[fileName], this.siteComponents);
        });

        const injections = {
            ProviderDefinitions: views.map((view) => view.getComponentDef()).join('\n') + this.defineSiteProviders(),
            StateDefinitions: this.buildStateDefinition(views),
        };

        let injection;
        let compiledSrc = this.moduleTemplate;
        // tslint:disable-next-line:no-conditional-assignment
        while ((injection = this.replacementPattern.exec(this.moduleTemplate)) !== null) {
            const [match, symbol] = injection;
            compiledSrc = compiledSrc.replace(match, injections[symbol]);
        }

        return compiledSrc;
    }

    private defineSiteProviders(): string {
        if (this.siteTree === null) {
            return '';
        }

        return this.siteComponents.reduce((definitions, script) => {
            const type = this.getProviderType(script);
            // skip scripts not flagged as providers in their name
            // skip controllers for now unless more complex sites are supported
            if (type === null || type === 'controller') { return definitions; }
            const providerName = SiteModuleGenerator.getProviderName(script);
            const providerPath = this.getProviderPath(script);
            return `${definitions}app.${type}('${this.siteTree.ADT[providerName]}', require('${providerPath}'));\n`;
        }, '\n');
    }

    private getProviderType(script: string) {
        return Object.keys(Config.ngProviderFlags).reduce((type, candidate) => {
            const flag = Config.ngProviderFlags[candidate];
            return type === null && script.indexOf(`.${flag}.`) > -1 ? candidate : type;
        }, null);
    }

    private getProviderPath(script: string): string {
        const pathSplitPattern = new RegExp(`[\\\\\\/]${this.site.name}`);
        return slash(path.join(`sites/${this.site.name}`, script.split(pathSplitPattern).pop()));
    }

    /**
     * Get an array of all
     * @returns {Promise<string[]>}
     */
    private async readSiteScripts(): Promise<string[]> {
        const isScript = (file) => file.indexOf('.js') > -1 && file.indexOf('.js.map') === -1;
        return (await readdir(this.sitePath)).filter(isScript);
    }

    private buildStateDefinition(views: SiteView[]): string {
        return views.reduce((statement: string, view: SiteView) => {
            return `${statement}\n.state(${view.getStateDef()})`;
        }, this.stateProvider);
    }
}
