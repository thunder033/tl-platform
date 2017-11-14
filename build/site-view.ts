import {ISiteManifest} from './site-manifest';
import {Config} from './config';
import * as path from 'path';
import * as slash from 'slash';

export interface IViewMap {[fileName: string]: string; }

export class SiteView {
    private componentName: string;

    /**
     *
     * @param {ISiteManifest} site
     * @param {string} name
     * @param {string} template
     * @param {string} components
     */
    constructor(
        private readonly site: ISiteManifest,
        private readonly name: string,
        private readonly template: string,
        private readonly components: string[]) {
        this.componentName = `${this.site.name}.${this.name}`;
    }

    public getComponentDef(): string {
        const ctrlPath = this.getController();
        return `app.component('${this.componentName}', {controller: require('${ctrlPath}'), template: \`${this.template}\`});`;
    }

    public getStateDef(): string {
        return `{name: '${this.name}', component: '${this.componentName}', url: '/${this.name}'}`;
    }

    private getController(): string {
        // the leading character group matches a back or forward slash
        const controllerPattern = new RegExp(`[\\\\\\/]${this.name}.${Config.ngProviderFlags.controller}.js`);
        const pathSplitPattern = new RegExp(`[\\\\\\/]${this.site.name}`);
        const viewCtrl: string = this.components.reduce((ctrl, component) => {
                if (ctrl !== '') { return ctrl; }
                return component.match(controllerPattern) !== null ? component : ctrl;
            }, '');
        // FIXME: (somewhat brittle) convert to relative path
        return viewCtrl === '' ? 'core/static.ctrl.js' : slash(path.join(`sites/${this.site.name}`, viewCtrl.split(pathSplitPattern).pop()));
    }
}
