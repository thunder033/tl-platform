import { IServiceProvider } from 'angular';
import {ngAnnotate} from "lib/injector-plus";

export interface SiteParameters {
    host: string;
    name: string;
    stylesheets?: string[];
    scripts?: string[];
    views: string[];
}

export abstract class SiteConfig implements SiteParameters {
    public stylesheets: string[];
    public scripts: string[];
    public host: string;
    public name: string;
    public views: string[];

    constructor(options: SiteParameters) {
        Object.assign(this, options);
    }
}

export class AppliedSiteConfig extends SiteConfig {
    constructor(options: SiteParameters) {
        super(Object.assign(new DefaultSiteConfig(), options));
    }
}

class DefaultSiteConfig extends SiteConfig {
    constructor() {
        super({
            host: '',
            name: '',
            scripts: ['bundle.min.js'],
            stylesheets: ['release.css'],
            views: [],
        });
    }
}

export class SiteConfigProvider implements IServiceProvider {
    private config: SiteConfig;

    constructor() {
        this.config = new DefaultSiteConfig();
    }

    public $get(): SiteConfig {
        return new AppliedSiteConfig(this.config);
    }
}

module.exports = ngAnnotate(SiteConfigProvider);
