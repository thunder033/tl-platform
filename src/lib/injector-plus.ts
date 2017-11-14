import 'reflect-metadata';

export interface InjectableMethodCtor {
    new(): InjectableMethod;
}

export interface InjectableMethod {
    exec(...args): any;
}

const injectableMethodName = 'exec';
const annotationKey = Symbol('dependencies');

/**
 * Define the injection annotation for a given angular provider
 * @param {string} identifier
 * @returns {ParameterDecorator}
 */
export function inject(identifier: string): ParameterDecorator {
    return function annotation(target: {(...args): any} | Function, key: string, index: number) {
        if (key && key !== injectableMethodName) {
            throw new TypeError('Dependencies can only be injected on constructor or injectable method executor');
        } else if (key) {
            target = target.constructor;
        }

        const annotations: string[] = Reflect.getOwnMetadata(annotationKey, target) || new Array(target.length);
        annotations[index] = identifier;
        Reflect.defineMetadata(annotationKey, annotations, target);
    };
}

/**
 * Construct an angular annotation array from dependency metadata
 * @param {Function} provider
 * @returns {Array<string | Function>}
 */
export function ngAnnotate(provider: Function | InjectableMethodCtor): Array<string | Function> {
    const annotations: string[] = Reflect.getOwnMetadata(annotationKey, provider) || [];

    let method = provider;
    let methodName = provider.name;

    if (provider.length === 0 && provider.prototype.hasOwnProperty(injectableMethodName)) {
        method = provider.prototype[injectableMethodName];
        methodName += `.${injectableMethodName}`;
    }

    if(annotations.length !== method.length) {
        throw new Error(
            `Annotations are not defined for all dependencies of ${methodName}: 
            expected ${method.length} annotations and found ${annotations.length}`);
    }

    return [...annotations, method];
}

type DepTree = {
    [key: string]: string | DepTree;
};

export function buildTree(tree: DepTree, module: string) {
    try {
        JSON.stringify(tree);
    } catch (e) {
        throw new TypeError('Tree object must be serializable to build a valid tree');
    }

    function traverseNode(node: any, prop: string, identifier: string[]) {
        const value = node[prop];
        if (typeof value === 'string' && !value) {
            node[prop] = [ ...identifier, prop].join('.');
        } else if (typeof value === 'object' && value !== null) {
            Object.keys(value).forEach((key) => {
                traverseNode(value, key, [...identifier, prop]);
            });
        }
    }

    Object.keys(tree).forEach((key) => {
        traverseNode(tree, key, [module]);
    });
}
