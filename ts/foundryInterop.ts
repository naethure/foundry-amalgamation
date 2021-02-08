import * as Constants from "./constants.js";

declare const game: any;

export interface IClientSettings {
    register(module: string, key: string, data: any): void;
    set(module: string, key: string, value: any): void;
    get(module: string, key: string): any;
}
export const ClientSettings: IClientSettings = {
    register: (module: string, key: string, data: any) => game.settings.register(module, key, data),
    set: (module: string, key: string, value: any) => game.settings.set(module, key, value),
    get: (module: string, key: string) => game.settings.get(module, key)
}


export interface IHooks {
    call(hook: string, ...args: Array<any>): void;
    callAll(hook: string, ...args: Array<any>): void;
    off(hook: string, fn: ((...args: Array<any>) => void) | ((...args: Array<any>) => boolean) | number): void;
    on(hook: string, fn: ((...args: Array<any>) => void) | ((...args: Array<any>) => boolean)): number;
    once(hook: string, fn: ((...args: Array<any>) => void) | ((...args: Array<any>) => boolean)): number;
}
export declare const Hooks: IHooks;
export function RunOnInit(fn: () => void): void {
    Hooks.once(Constants.Hooks.Init, fn);
}


export interface ILocalization {
    localize(key: string): string;
}
export const Localization: ILocalization = {
    localize: (key: string) => game.i18n.localize(key)
}