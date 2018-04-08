"use strict";
var _ = require("lodash");
var MJProtocols = require("../protocols/mahjong");
var BotsModule;
(function (BotsModule) {
    var Bots = /** @class */ (function () {
        function Bots(rule, seat) {
            this.rule = rule;
            this.queColor = MJProtocols.Color.Unknow;
            this.cutGroups = [];
            this.holdCards = [];
            this.turnCard = -1;
            this.huFlag = null;
            this.seat = seat;
        }
        Bots.prototype.onAction = function (action) {
            console.log('seat %s => actions %s', this.seat, JSON.stringify(action));
            if (action.type === MJProtocols.ActionType.ZhuaPai) {
                this.holdCards = action.list[0];
            }
        };
        Bots.prototype.onAnswer = function (actions) {
            console.log('seat %s => answers %s', this.seat, JSON.stringify(actions));
            var action = _.cloneDeep(actions[_.random(0, actions.length - 1)]);
            if (action.type === MJProtocols.ActionType.Da) {
                action.list = [[action.list[0][0]]];
            }
            return action;
        };
        return Bots;
    }());
    BotsModule.Bots = Bots;
})(BotsModule || (BotsModule = {}));
module.exports = BotsModule;
