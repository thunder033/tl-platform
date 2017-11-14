export interface ITaskRunner {
    copySiteAssets(siteDir: string);
    minifySiteCSS(siteDir: string);
}
