import * as RuleModule from '../rule';
import * as _ from 'lodash';
import * as MJProtocols from '../../protocols/mahjong';
import * as CardUtils from '../../utils/card_utils';
module DaZhongRuleModule {
    let cardMaps = [
        { 'color': MJProtocols.Color.Bing, 'values': [1, 2, 3, 4, 5, 6, 7, 8, 9], 'num': 4 },// 1-9 筒
        { 'color': MJProtocols.Color.Wan, 'values': [1, 2, 3, 4, 5, 6, 7, 8, 9], 'num': 4 },// 1-9 万
        { 'color': MJProtocols.Color.Tiao, 'values': [1, 2, 3, 4, 5, 6, 7, 8, 9], 'num': 4 },// 1-9 条
        { 'color': MJProtocols.Color.Jian, 'values': [1, 2, 3], 'num': 4 },// 中,发,白
        { 'color': MJProtocols.Color.Feng, 'values': [1, 2, 3, 4], 'num': 4 }// 东,南,西,北
    ];
    export class DaZhongRule extends RuleModule.Rule {
        constructor() {
            super();
            this.name = '大众规则';
            this.seatNum = 4;
            this.handCardsNum = 13;
            this.Processs = [
                MJProtocols.Process.FaPai,
                MJProtocols.Process.XingPai,
                MJProtocols.Process.JieSuan
            ];
            this.allCards = [];
            for (let i in cardMaps) {
                for (let j in cardMaps[i].values) {
                    for (let index = 1; index <= cardMaps[i].num; index++) {
                        let card: MJProtocols.Card = { color: cardMaps[i].color, value: cardMaps[i].values[j], index: index };
                        this.allCards.push(CardUtils.getCardNumber(card));
                    }
                }
            }
            this.allCards = _.shuffle(this.allCards);
            this.allRules = [
                MJProtocols.RuleType.XiaJiaChi  // 下家吃
            ];
            this.rulesMaps = {};
            for (let i in this.allRules) {
                this.rulesMaps[this.allRules[i]] = true;
            }
        }

    }
}
export = DaZhongRuleModule;