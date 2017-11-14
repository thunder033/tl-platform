
import * as path from 'path';

export class Config {
    public static location = {
        assets: 'assets',
        dist: './dist',
        sites: 'src/sites',
        src: './src',
        staticDist: './dist/static',
        tmp: './.tmp',
    };

    public static file = {
        compiledSiteModule: 'site.module.compiled.js',
        distJs: 'bundle.js',
        siteIndex: 'siteIndex.json',
        siteManifest: 'manifest.json',
        siteModule: 'site.module.js',
        viewsBundle: 'views.json',
    };

    public static ngProviderFlags = {
        controller: 'ctrl',
        factory: 'factory',
        service: 'service',
    };

    public static paths = {
        siteIndex: './' + path.join(Config.location.dist, Config.file.siteIndex),
        siteModuleTemplate: './src/core/site.module.template.js',
    };

    public static siteModuleTemplate = './src/core/site.module.template.js';

    public static browserify = {
        aliases: { // add single file aliases to browserify requires
            '@tree': './src/dt.js',
            '@uirouter/angularjs': './node_modules/@uirouter/angularjs/release/angular-ui-router.min.js',
            'angular': './scripts/angular.min.proxy.js',
        },
        options: {
            paths: [Config.location.src],  // here to allow 'lib/{my utility}'
        },
    };

    public static rootRequire(module) {
        return require(`./../${module}`);
    }
}

// Generate complex/compound values

