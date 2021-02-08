declare const game: any;
declare const Hooks: any;

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

export interface IHookManager {
    call(hook: string, ...args: Array<any>): void;
    callAll(hook: string, ...args: Array<any>): void;
    off(hook: string, fn: ((...args: Array<any>) => void) | ((...args: Array<any>) => boolean) | number): void;
    on(hook: string, fn: ((...args: Array<any>) => void) | ((...args: Array<any>) => boolean)): number;
    once(hook: string, fn: ((...args: Array<any>) => void) | ((...args: Array<any>) => boolean)): number;
}
export const HookManager: IHookManager = {
    call: (hook: string, ...args: Array<any>) => Hooks.call(hook, ...args),
    callAll: (hook: string, ...args: Array<any>) => Hooks.callAll(hook, ...args),
    off: (hook: string, fn: ((...args: Array<any>) => void) | ((...args: Array<any>) => boolean) | number) => Hooks.off(hook, fn),
    on: (hook: string, fn: ((...args: Array<any>) => void) | ((...args: Array<any>) => boolean)) => Hooks.on(hook, fn),
    once: (hook: string, fn: ((...args: Array<any>) => void) | ((...args: Array<any>) => boolean)) => Hooks.once(hook, fn)
}

export interface ILocalization {
    localize(key: string): string;
}
export const Localization: ILocalization = {
    localize: (key: string) => game.i18n.localize(key)
}