import * as path from 'path';
import * as fs from 'fs';
import {ISiteManifest} from './site-manifest';
import {ITaskRunner} from './task-runner';
import {BrowserifyObject} from 'browserify';
import {SiteModuleGenerator} from './site-module-generator';
import {IViewMap} from './site-view';
import {Config} from './config';
import {Bundler} from './browserify-factory';

export class SitePrecompiler {

    private static taskRunner: ITaskRunner;

    private readonly site: ISiteManifest;
    private viewMap: IViewMap;
    private files: string[];
    private sitePath: string;

    /**
     * Constructs a site compiler for the given site
     * @param {string} siteName
     * @returns {SitePrecompiler}
     */
    public static load(siteName: string): SitePrecompiler {
        if (!siteName || typeof siteName !== 'string') {
            throw new ReferenceError('Cannot instantiate site configuration, siteName parameter is missing or invalid');
        }

        const sitePath = path.join(Config.location.sites, siteName);
        // path.join normalizes paths and removes the "./" needed for local requires
        const manifest: ISiteManifest = require('./../' + path.join(sitePath, Config.file.siteManifest));

        if (siteName !== manifest.name) {
            throw new Error(`Site source directory must match manifest name. ${siteName} != ${manifest.name}`);
        }

        return new SitePrecompiler(manifest);
    }

    /**
     * Determines if the file name references a view type file
     * @param {string} fileName
     * @returns {boolean}
     */
    private static isView(fileName: string): boolean {
        // Can add more file extensions to array to add more view types
        return ['html'].indexOf(fileName.split('.').pop()) > -1;
    }

    constructor(manifest: ISiteManifest) {
        this.site = manifest;
        this.viewMap = {};
        this.sitePath = path.join(Config.location.sites, this.site.name);
    }

    public getManifest(): ISiteManifest {
        return this.site;
    }

    public getViews(): IViewMap {
        return this.viewMap;
    }

    public async prepare(): Promise<BrowserifyObject> {
        this.readSiteFiles();
        this.loadViews();

        if (!this.site.module) { // if the site is not configured with an explicit module, set value
            this.site.module = this.siteIsStatic() ? 'tl-platform.static' : this.site.name;
        }

        this.createSiteDir();
        return await this.prepareBundler();
    }

    private readSiteFiles() {
        this.files = fs.readdirSync(this.sitePath);
    }

    private loadViews() {
        this.files.filter(SitePrecompiler.isView).forEach((viewFile) => {
            this.viewMap[viewFile] = fs.readFileSync(path.join(this.sitePath, viewFile)).toString();
        });
    }

    private createSiteDir() {
        const siteOut = path.join(Config.location.dist, this.site.name);
        try {
            fs.mkdirSync(siteOut);
        } catch (e) {
            if (e.code !== 'EEXIST') {
                throw e;
            }
        }
    }

    private siteIsStatic(): boolean {
        if (typeof this.site.isStatic === 'undefined') {
            return this.site.isStatic;
        }

        if (this.files.indexOf(Config.file.siteModule) > -1) {
            return false;
        }

        const ctrlFlag = '.ctrl';
        return this.files.filter((file) => file.indexOf(ctrlFlag) > -1).length <= 0;
    }

    private async prepareBundler(): Promise<BrowserifyObject> {
        const siteModulePath = path.join(Config.location.sites, this.site.name, Config.file.siteModule);
        let generator: SiteModuleGenerator;
        if (this.files.indexOf(Config.file.siteModule) > -1) { // a site module has been provided
            const moduleSrc = fs.readFileSync(siteModulePath).toString();
            generator = new SiteModuleGenerator(this.site, this.viewMap, moduleSrc);
        } else if (!this.siteIsStatic()) { // a site module has not provided, but the site has controllers
            generator = new SiteModuleGenerator(this.site, this.viewMap);
        } else {
            return null; // the site is static and will use the default static app
        }

        const siteModuleOut = path.join(Config.location.sites, this.site.name, Config.file.compiledSiteModule);
        fs.writeFileSync(siteModuleOut, await generator.build(), {encoding: 'utf-8'});

        // const siteDist = path.join(location.dist, siteName);
        return Bundler.buildBrowserify(siteModuleOut);
    }
}
