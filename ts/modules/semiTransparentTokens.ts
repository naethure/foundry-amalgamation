import * as Settings from "../settings.js";
import * as Constants from "../constants.js";
import * as FoundryInterop from "../foundryInterop.js";
import * as Modules from "../modules.js"

declare interface Control {
    name: string;
    title: string;
    layer: string;
    icon: string;
    visible: boolean;
    tools: Tool[];
    activeTool: string;
}
declare interface Tool {
    name: string;
    title: string;
    icon: string;
    onClick?: Function;
    button?: boolean;
    toggle?: boolean;
    active?: boolean;
}

declare const game: any;
declare const Token: any;
declare const toRadians: any;
declare const canvas: any;

const flagName = "semiTransparent";

FoundryInterop.HookManager.on(Constants.Hooks.Init, () => {

    const enabledSetting = new Settings.BooleanSetting("SemiTransparentTokens.Enabled", FoundryInterop.Localization.localize("Naethure.Settings.SemiTransparentTokens.Enabled.Title"), FoundryInterop.Localization.localize("Naethure.Settings.SemiTransparentTokens.Enabled.Description"), Settings.SettingScope.World, true);
    const semiTransparentTokensModule = new Modules.Module("Semi-Transparent Tokens", enabledSetting, true, true);
    
    semiTransparentTokensModule.RegisterHook(Constants.Hooks.Ready, () => {
        //Updates https://foundryvtt.com/api/foundry.js.html#43588
        Token.prototype.refresh = function() {
            // Token position and visibility
            if ( !this._movement ) this.position.set(this.data.x, this.data.y);
            // Size the texture aspect ratio within the token frame
            const tex = this.texture;
            if ( tex ) {
                let aspect = tex.width / tex.height;
                if ( aspect >= 1 ) {
                    this.icon.width = this.w * this.data.scale;
                    this.icon.scale.y = this.icon.scale.x;
                } else {
                    this.icon.height = this.h * this.data.scale;
                    this.icon.scale.x = this.icon.scale.y;
                }
            }
            // Mirror horizontally or vertically
            this.icon.scale.x = Math.abs(this.icon.scale.x) * (this.data.mirrorX ? -1 : 1);
            this.icon.scale.y = Math.abs(this.icon.scale.y) * (this.data.mirrorY ? -1 : 1);
            // Set rotation, position, and opacity
            this.icon.rotation = toRadians(this.data.lockRotation ? 0 : this.data.rotation);
            this.icon.position.set(this.w / 2, this.h / 2);
            if(!!this.getFlag(Constants.ModuleShortName, flagName)) {
                this.icon.alpha = this.data.hidden ? 0.25 : 0.75;
            } else {
                this.icon.alpha = this.data.hidden ? 0.5 : 1.0;
            }
            // Refresh Token border and target
            this._refreshBorder();
            this._refreshTarget();
            // Refresh nameplate and resource bars
            this.nameplate.visible = this._canViewMode(this.data.displayName);
            this.bars.visible = this._canViewMode(this.data.displayBars);
        };
    });
    semiTransparentTokensModule.RegisterHook(Constants.Hooks.GetSceneControlButtons, (controls: Control[]) => {
        if (!game.user.isGM) return;
        var tileControlGroup = controls.find(x => x.name == "token");
        if(tileControlGroup == undefined) {
            console.error("Naethure's Amalgamation | Semi-Transparent-Token | Couldn't find token (basic) control group.");
            return;
        }
        tileControlGroup.tools.push({
            name: "toggleTokenSemiTransparency",
            title: "Naethure.SemiTransparentTokens.ControlTitles.ToggleTokenSemiTransparency",
            icon: "fas fa-star-half",
            button: true,
            onClick: () => canvas.getLayer("TokenLayer").controlled.forEach((x:any) => x.setFlag(Constants.ModuleShortName, flagName, !x.getFlag(Constants.ModuleShortName, flagName)))
        });
    });
});