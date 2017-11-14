import {state, StateMachine} from 'lib/state-machine';

// eventual source mapping stuff
// const convert = require('convert-source-map');
// const currentScript = document.currentScript.src;

export class Level extends StateMachine {
    @state public static None;
    @state public static Error;
    @state public static Warn;
    @state public static Info;
    @state public static Debug;
    @state public static Verbose;
}

/**
 * Browser-friendly logging utility with multiple loggers and level switches
 * @author Greg Rozmarynowycz<greg@thunderlab.net>
 */
export class Logger {
    private loggers: any[];
    private state: Level;

    /**
     * @param {string} stack
     * @param {number} [calls=0]
     */
    private static getTrace(stack, calls = 0) {
        const call = stack
            .split('\n')[calls + 3]
            .split(' at ').pop();
        // we have to trace back to 2 calls because of calls from the logger
        const file = call.split('/').pop();
        const method = call.split(' (').shift();

        return `(${method}:${file}`;
    }

    constructor() {
        this.state = new Level();
        this.state.setState(Level.Info);
        // add console logger by default
        this.loggers = [{level: Level.Debug, api: console}];
    }

    public addLogger(logger, loggerLevel) {
        this.loggers.push({api: logger, level: loggerLevel});
    }

    public config(params: {level: Level}) {
        this.state.setState(typeof (params.level) !== 'undefined' ? params.level : (this.state.getState() || Level.Error));
    }

    public error(message: string);
    public error(...args);
    public error(...args) {
        if (this.state.getState() < Level.Error) {
            return;
        }

        this.logOut(Array.prototype.slice.call(args), Level.Error, 'error');
    }

    public warn(message: string);
    public warn(...args);
    public warn(...args) {
        if (this.state.getState() < Level.Warn) {
            return;
        }

        this.logOut(Array.prototype.slice.call(args), Level.Warn, 'warn');
    }

    public info(message: string);
    public info(...args);
    public info(...args) {
        if (this.state.getState() < Level.Info) {
            return;
        }
        this.logOut(Array.prototype.slice.call(args), Level.Info, 'info');
    }

    /**
     * Output debug level logging message
     * @param {string} message
     */
    public debug(message: string);
    public debug(...args);
    public debug(...args) {
        if (this.state.getState() < Level.Debug) {
            return;
        }

        this.logOut(Array.prototype.slice.call(args), Level.Debug, 'debug');
    }

    public verbose(message: string);
    public verbose(...args);
    public verbose(...args) {
        if (this.state.getState() < Level.Verbose) {
            return;
        }

        this.logOut(Array.prototype.slice.call(args), Level.Verbose, 'debug');
    }

    private logOut(args, msgLevel, func) {
        const stack = Error().stack;
        const trace = Logger.getTrace(stack);
        const level = this.state.getState();

        if (msgLevel > level) {
            return;
        }

        // args[0] = `${trace} ${args[0]}`;
        args.unshift(trace);
        for (let i = 0, l = this.loggers.length; i < l; i++) {
            const loggerLevel = Number.isInteger(this.loggers[i].level) ? this.loggers[i].level : level;
            if (msgLevel <= loggerLevel) {
                this.loggers[i].api[func](...args);
            }
        }
    }
}

// we need to expose Level && Logger
function loggerFactory() { return new Logger(); }
loggerFactory['Level'] = Level;
loggerFactory['Logger'] = Logger;

module.exports = loggerFactory;
