import * as GameModule from '../logic/game';
import * as BotsModule from '../logic/bots';
import * as DaZhongRuleModule from '../logic/rules/dazhong';
import * as MJProtocols from '../protocols/mahjong';
function main() {
    let rule = new DaZhongRuleModule.DaZhongRule();
    let game = new GameModule.Game(rule);
    let botses: BotsModule.Bots[] = [];
    for (let seat = 0; seat < rule.seatNum; seat++) {
        let bots = new BotsModule.Bots(rule, seat);
        botses.push(bots);
    }
    game.init(
        function (actions: MJProtocols.Action[]) {
            console.log('action');
            for (let seat in actions) {
                if (!actions[seat]) continue;
                botses[seat].onAction(actions[seat]);
            }
            game.onNext();
        },
        function (actions: MJProtocols.Action[][]) {
            console.log('answer');
            for (let i in actions) {
                if (!actions[i]) continue;
                let action = botses[i].onAnswer(actions[i]);
                let seat = parseInt(i);
                game.onAnswer(seat, action);
            }
        });
    game.onStart();
    setInterval(function () {
        console.log('11221');
    }, 5000)
}

main();