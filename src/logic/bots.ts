import * as RuleModule from './rule';
import * as GameModule from './game';
import * as _ from 'lodash';
import * as MJProtocols from '../protocols/mahjong';
import * as CardUtils from '../utils/card_utils';
module BotsModule {
    export class Bots {
        /**座位 */
        seat: number
        /** 手牌 */
        holdCards: number[]
        /** 附录 */
        cutGroups: MJProtocols.Group[]
        /** 当前牌 */
        turnCard: number
        /** 规则  */
        rule: RuleModule.Rule
        /** 是否有缺 */
        queColor: MJProtocols.Color
        /** 胡牌标记 */
        huFlag: MJProtocols.HuFlag

        constructor(rule: RuleModule.Rule, seat: number) {
            this.rule = rule;
            this.queColor = MJProtocols.Color.Unknow;
            this.cutGroups = [];
            this.holdCards = [];
            this.turnCard = -1;
            this.huFlag = null;
            this.seat = seat;
        }

        onAction(action: MJProtocols.Action) {
            if (action.type === MJProtocols.ActionType.ZhuaPai) {
                console.log('seat %s => holdCards %s length %d', this.seat, JSON.stringify(action.list[0]),action.list[0].length);
                this.holdCards = action.list[0];
            }else{
                console.log('seat %s => actions %s', this.seat, JSON.stringify(action));
            }
        }

        onAnswer(actions: MJProtocols.Action[]) {
            console.log('seat %s => answers %s', this.seat, JSON.stringify(actions));
            let action = _.cloneDeep(actions[_.random(0, actions.length - 1)]);
            if (action.type === MJProtocols.ActionType.Da) {
                action.list = [[action.list[0][0]]];
            }
            return action;
        }

    }
}
export = BotsModule;
