import * as Constants from "./constants";
import * as FoundryInterop from "./foundryInterop";

export enum SettingScope {
    Client = "client",
    World = "world"
}

interface SettingsData {
    name: string;
    hint: string;
    scope: string;
    config: boolean;
    type: object;
    default: unknown;
    callback?(value: unknown): void;
}

export abstract class Setting {
    name: string;
    protected title: string;
    protected description: string;
    protected scope: SettingScope;

    constructor(name: string, title: string, description: string, scope: SettingScope) {
        this.name = name;
        this.title = title;
        this.description = description;
        this.scope = scope;
    }

    protected abstract GetRegistrationType(): object;
    protected abstract BuildData(): SettingsData;
    
    Register(): void {
        FoundryInterop.ClientSettings.register(Constants.ModuleShortName, this.name, this.BuildData());
    }
}


export abstract class TypedSetting<T> extends Setting {
    private defaultValue: T;
    private callbacks: Array<(value: T) => void> = [];

    constructor(name: string, title: string, description: string, scope: SettingScope, defaultValue: T) {
        super(name, title, description, scope);
        this.defaultValue = defaultValue;
    }
    
    protected BuildData(): SettingsData {
        var data: SettingsData = {
            name: this.title,
            hint: this.description,
            scope: this.scope,
            config: true,
            type: this.GetRegistrationType(),
            default: this.defaultValue,
        };
        if(this.callbacks.length > 0) {
            data.callback = (value: T) => {
                for(const callback of this.callbacks) {
                    callback(value);
                }
            }
        }
        return data;
    }

    GetValue(): T {
        return FoundryInterop.ClientSettings.get(Constants.ModuleShortName, this.name);
    }

    SetValue(value: T) {
        return FoundryInterop.ClientSettings.set(Constants.ModuleShortName, this.name, value);
    }

    RegisterCallback(callback: (value: T) => void): TypedSetting<T> {
        this.callbacks.push(callback);
        return this;
    }
}

export class BooleanSetting extends TypedSetting<boolean> {
    protected GetRegistrationType(): object {
        return Boolean;
    }
}
export class NumberSetting extends TypedSetting<number> {
    private range: null | {min: number, max: number, step: number} = null;
    protected GetRegistrationType(): object {
        return Number;
    }
    SetRange(min: number, max: number, step: number): NumberSetting {
        this.range = {min: min, max: max, step: step};
        return this;
    }
    protected BuildData(): SettingsData {
        if(this.range == null) {
            return super.BuildData();
        } else {
            let data: (SettingsData & { range: {min: number, max: number, step: number} }) = {...super.BuildData(), "range": this.range};
            return data;
        }
    }
}
export class StringSetting extends TypedSetting<string> {
    private choices: Array<[name: string, description: string]> = [];
    protected GetRegistrationType(): object {
        return String;
    }
    AddChoice(name: string, description: string): StringSetting {
        this.choices.push([name, description]);
        return this;
    }
    protected BuildData(): SettingsData {
        if(this.choices.length == 0) {
            return super.BuildData();
        } else {
            let data: (SettingsData & { choices: object }) = {...super.BuildData(), "choices": Object.fromEntries(this.choices)};
            return data;
        }
    }
}
