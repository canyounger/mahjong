"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GameModule = require("../logic/game");
var BotsModule = require("../logic/bots");
var DaZhongRuleModule = require("../logic/rules/dazhong");
function main() {
    var rule = new DaZhongRuleModule.DaZhongRule();
    var game = new GameModule.Game(rule);
    var botses = [];
    for (var seat = 0; seat < rule.seatNum; seat++) {
        var bots = new BotsModule.Bots(rule, seat);
        botses.push(bots);
    }
    game.init(function (actions) {
        console.log('action');
        for (var seat in actions) {
            if (!actions[seat])
                continue;
            botses[seat].onAction(actions[seat]);
        }
        game.onNext();
    }, function (actions) {
        console.log('answer');
        for (var i in actions) {
            if (!actions[i])
                continue;
            var action = botses[i].onAnswer(actions[i]);
            var seat = parseInt(i);
            game.onAnswer(seat, action);
        }
    });
    game.onStart();
    setInterval(function () {
        console.log('11221');
    }, 5000);
}
main();
