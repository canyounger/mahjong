import * as MJProtocols from '../protocols/mahjong';
module RuleModule {
    export class Rule {
        /** 规则名称 */
        name: string
        /** 座位数量 */
        seatNum: number
        /** 手牌数量 */
        handCardsNum: number
        /** 消息进程流 */
        Processs: MJProtocols.Process[]
        /** 所有的牌数量 */
        totalCardNum: number;
        /** 所有牌 */
        allCards: number[];
        allRules: MJProtocols.RuleType[];
        rulesMaps: {};
    }
}
export = RuleModule;