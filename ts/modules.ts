import * as Settings from "./settings.js";
import * as Constants from "./constants.js";
import * as FoundryInterop from "./foundryInterop.js";

export class Module {
    name: string;
    isEnabledSetting: Settings.BooleanSetting;
    requiresRefreshToEnable: boolean;
    requiresRefreshToDisable: boolean;
    settings: Map<string, Settings.Setting> = new Map<string, Settings.Setting>();
    
    constructor(name: string, isEnabledSetting: Settings.BooleanSetting, requiresRefreshToEnable: boolean, requiresRefreshToDisable: boolean) {
        this.name = name;
        this.isEnabledSetting = isEnabledSetting;
        this.requiresRefreshToEnable = requiresRefreshToEnable;
        if(this.requiresRefreshToEnable) {
            this.isEnabledSetting.RegisterCallback((value) => {
                if(value == true) {
                    window.location.reload();
                }
            });
        }
        this.requiresRefreshToDisable = requiresRefreshToDisable;
        if(this.requiresRefreshToDisable) {
            this.isEnabledSetting.RegisterCallback((value) => {
                if(value == false) {
                    window.location.reload();
                }
            });
        }
        Modules.push(this);
    }

    RegisterHook(hook: Constants.Hooks, fn: ((...args: Array<any>) => void) | ((...args: Array<any>) => boolean)): Module {
        if(!RegisteredHooks.has(hook)) {
            RegisteredHooks.set(hook, []);
            let id = FoundryInterop.HookManager.on(hook, (...args) => HookCallback(hook, args));
            RegisteredHookIds.set(hook, id);
        }
        RegisteredHooks.get(hook)!.push({module: this, hook: hook, fn: fn});
        return this;
    }
    UnregisterHook(hook: Constants.Hooks, fn: ((...args: Array<any>) => void) | ((...args: Array<any>) => boolean)): Module {
        if(!RegisteredHooks.has(hook)) {
            return this;
        }
        RegisteredHooks.set(hook, RegisteredHooks.get(hook)!.filter((x) => x.fn !== fn));

        if(RegisteredHooks.get(hook)!.length == 0) {
            FoundryInterop.HookManager.off(hook, RegisteredHookIds.get(hook)!);
            RegisteredHooks.delete(hook);
            RegisteredHookIds.delete(hook);
        }
        return this;
    }
}

export const Modules: Array<Module> = [];

interface RegisteredHook {
    module: Module;
    hook: Constants.Hooks;
    fn: ((...args: Array<any>) => void) | ((...args: Array<any>) => boolean);
}

const RegisteredHookIds: Map<Constants.Hooks, number> = new Map<Constants.Hooks, number>();
const RegisteredHooks: Map<Constants.Hooks, Array<RegisteredHook>> = new Map<Constants.Hooks, Array<RegisteredHook>>();

function HookCallback(hook: Constants.Hooks, ...args: Array<any>): boolean {
    if(!RegisteredHooks.has(hook)) {
        return true;
    }
    let registeredHooks =  RegisteredHooks.get(hook)!;
    for(const registeredHook of registeredHooks) {
        if(registeredHook.module.isEnabledSetting.GetValue()) {
            if(registeredHook.fn(args) === false) {
                return false;
            }
        }
    }
    return true;
}

