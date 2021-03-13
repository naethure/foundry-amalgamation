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
declare const Tile: any;
declare const toRadians: any;
declare const NormalizedRectangle: any;

FoundryInterop.HookManager.on(Constants.Hooks.Init, () => {

    const enabledSetting = new Settings.BooleanSetting("TileOpacityControls.Enabled", FoundryInterop.Localization.localize("Naethure.Settings.TileOpacityControls.Enabled.Title"), FoundryInterop.Localization.localize("Naethure.Settings.TileOpacityControls.Enabled.Description"), Settings.SettingScope.World, true);
    const tileOpacityControlsModule = new Modules.Module("Tile Opacity Controls", enabledSetting, true, true);
    
    const opacitySetting = new Settings.NumberSetting("TileOpacityControls.CurrentOpacity", FoundryInterop.Localization.localize("Naethure.Settings.TileOpacityControls.CurrentOpacity.Title"), FoundryInterop.Localization.localize("Naethure.Settings.TileOpacityControls.CurrentOpacity.Description"), Settings.SettingScope.World, 50);
    opacitySetting.SetRange(0, 100, 1);
    opacitySetting.Register();

    tileOpacityControlsModule.RegisterHook(Constants.Hooks.Ready, () => {
        //Updates https://foundryvtt.com/api/foundry.js.html#42808
        Tile.prototype.refresh = function() {
            // Set Tile position
            this.position.set(this.data.x, this.data.y);
            const aw = Math.abs(this.data.width);
            const ah = Math.abs(this.data.height);
            // Draw the sprite image
            let bounds = null;
            if ( this.data.img ) {
                const img = this.tile.img;
                // Set the tile dimensions and mirroring
                img.width = aw;
                if ( this.data.width * img.scale.x < 0 ) img.scale.x *= -1;
                img.height = ah;
                if ( this.data.height * img.scale.y < 0 ) img.scale.y *= -1;
                // Pivot in the center of the container
                img.anchor.set(0.5, 0.5);
                img.position.set(aw/2, ah/2);
                img.rotation = toRadians(this.data.rotation);
                // Toggle tile visibility
                img.alpha = this.data.hidden ? (opacitySetting.GetValue() / 100) : 1.0;
                bounds = this.tile.getLocalBounds(undefined, true);
            }
            // Draw a temporary background
            else {
                bounds = new NormalizedRectangle(0, 0, this.data.width, this.data.height);
                this.tile.bg.clear().beginFill(0xFFFFFF, 0.5).drawShape(bounds);
                this.tile.bg.visible = true;
            }
            // Allow some extra padding to detect handle hover interactions
            this.hitArea = this._controlled ? bounds.clone().pad(20) : bounds;
            // Update border frame
            this._refreshBorder(bounds);
            this._refreshHandle(bounds);
            // Set visibility
            this.alpha = 1;
            this.visible = !this.data.hidden || game.user.isGM;
            return this;
        };
    });
    tileOpacityControlsModule.RegisterHook(Constants.Hooks.GetSceneControlButtons, (controls: Control[]) => {
        if (!game.user.isGM) return;
        var tileControlGroup = controls.find(x => x.name == "tiles");
        if(tileControlGroup == undefined) {
            console.error("Naethure's Amalgamation | Tile Opacity Controls | Couldn't find tiles control group.");
            return;
        }
        tileControlGroup.tools.push({
            name: "increaseOpacity",
            title: "Naethure.TileOpacityControls.ControlTitles.IncreaseOpacity",
            icon: "fas fa-plus",
            button: true,
            onClick: () => opacitySetting.SetValue(Math.min(opacitySetting.GetValue() + 10, 100))
        });
        tileControlGroup.tools.push({
            name: "resetOpacity",
            title: "Naethure.TileOpacityControls.ControlTitles.ResetOpacity",
            icon: "fas fa-star-half",
            button: true,
            onClick: () => opacitySetting.SetValue(50)
        });
        tileControlGroup.tools.push({
            name: "decreaseOpacity",
            title: "Naethure.TileOpacityControls.ControlTitles.DecreaseOpacity",
            icon: "fas fa-minus",
            button: true,
            onClick: () => opacitySetting.SetValue(Math.max(opacitySetting.GetValue() - 10, 0))
        });
    });
});