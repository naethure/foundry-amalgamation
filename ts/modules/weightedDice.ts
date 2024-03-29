import * as Settings from "../settings.js";
import * as Constants from "../constants.js";
import * as FoundryInterop from "../foundryInterop.js";
import * as Modules from "../modules.js"

declare const DiceTerm: any;
declare const Dice: any;
declare const CONFIG: any;

export class UnweightedDie extends DiceTerm {
    constructor(termData:any) {
        super(termData);
        this.faces = 20;
    }
    /* -------------------------------------------- */
    /** @override */
    roll({minimize=false, maximize=false}={}) {
        const rand = CONFIG.Dice.randomUniform();
        let result = Math.ceil(rand * this.faces);
        if ( minimize ) result = 1;
        if ( maximize ) result = this.faces;
        const roll = {result, active: true};
        this.results.push(roll);
        return roll;
    }
}

FoundryInterop.HookManager.once(Constants.Hooks.Init, () => {

    const enabledSetting = new Settings.BooleanSetting("WeightedDice.Enabled", FoundryInterop.Localization.localize("Naethure.Settings.WeightedDice.Enabled.Title"), FoundryInterop.Localization.localize("Naethure.Settings.WeightedDice.Enabled.Description"), Settings.SettingScope.World, true);
    const weightedDiceModule = new Modules.Module("Weighted Dice", enabledSetting, true, true);
    
    weightedDiceModule.RegisterHook(Constants.Hooks.Ready, () => {
        //Updates https://foundryvtt.com/api/foundry.js.html#8392
        DiceTerm.prototype.roll = function({minimize=false, maximize=false}={}) {
            const d20Weights: Array<number> = [.0200, .0240, .0280, .0320, .0370, .0425, .0540, .0625, .0710, .0800, .0825, .0720, .0650, .0570, .0520, .0485, .0460, .0440, .0420, .0400];
            var rand = CONFIG.Dice.randomUniform();
            let result = Math.ceil(rand * this.faces);
            if ( this.faces == 20 ) {
                result = 0;
                while (rand >= 0 && result < d20Weights.length) {
                    rand -= d20Weights[result]!;
                    result++;
                }
            }
            if ( minimize ) {
                result = Math.min(1, this.faces);
            }
            if ( maximize ) {
                result = this.faces;
            }
            const roll = {result, active: true};
            this.results.push(roll);
            return roll;
        };
    });

    UnweightedDie.DENOMINATION = "u";
    CONFIG.Dice.types.push(UnweightedDie);
    CONFIG.Dice.terms["u"] = UnweightedDie;
});