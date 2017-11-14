/**
 * Fields the define how a site will be hosted
 */
export interface ISiteManifest {
    name: string;
    host: string;
    isStatic: boolean;
    description?: string;
    dependencyTreePath?: string;

    /**
     * An alternative module to use from the default (site name)
     */
    module: string;
}
