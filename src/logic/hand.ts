import * as RuleModule from './rule';
import * as _ from 'lodash';
import * as MJProtocols from '../protocols/mahjong';
import * as CardUtils from '../utils/card_utils';
module HandModule {
    export class Hand {
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

        public faPai(cards: number[]) {
            this.holdCards = cards;
        }

        /** 定缺 */
        public dingQue(color: MJProtocols.Color) {
            this.queColor = color;
        }

        public daPai(card: number) {
            CardUtils.removeCards(this.holdCards, [card]);
        }

        /** 设定当前牌 */
        public setTurnCard(card: number) {
            this.turnCard = card;
        }

        public setHuFlag(huFlag: MJProtocols.HuFlag) {
            this.huFlag = huFlag;
        }

        public setGuoShuiBuHu(huFlag: MJProtocols.HuFlag) {
            // TODO
        }

        public setGuoShuiBuPeng(card: number) {
            // TODO
        }

        public getHuFlag(huFlag: MJProtocols.HuFlag): MJProtocols.HuFlag {
            return _.cloneDeep(huFlag);
        }

        /** 是否还能继续打牌 */
        public isPlay(): boolean {
            return true;
        }

        /** 查找主动杠  暗杠 加杠*/
        public searchInitiativeGang(actions: MJProtocols.Action[]) {
            let anGangList = CardUtils.searchAnGangCardsList(this.holdCards);
            let jiaGangList = CardUtils.searchJiaGangCardsList(this.holdCards, this.cutGroups);
            let gangList = anGangList.concat(jiaGangList);
            if (gangList.length) {
                let action: MJProtocols.Action = { type: MJProtocols.ActionType.Gang, list: gangList };
                actions.push(action);
            }
        }

        /** 查找主动胡  自摸*/
        public searchInitiativeHu(huFlag: MJProtocols.HuFlag, actions: MJProtocols.Action[]) {
            let holdCardsCountMap = CardUtils.getCardCountMap(this.holdCards);
            if (CardUtils.checkHu(holdCardsCountMap)) {
                let action: MJProtocols.Action = { type: MJProtocols.ActionType.Hu };
                actions.push(action);
            }
        }

        /** 查找主动打*/
        public searchInitiativeDa(actions: MJProtocols.Action[]) {
            let daCards = CardUtils.searchDaCards(this.holdCards, this.queColor);
            let action: MJProtocols.Action = { type: MJProtocols.ActionType.Da, list: [daCards] };
            actions.push(action);
        }

        /** 查找被动杠  点杠 */
        public searchPassiveGang(card: number, actions: MJProtocols.Action[]) {
            let gangList = CardUtils.searchJiaGangCardsList(this.holdCards, this.cutGroups);
            if (gangList.length) {
                let action: MJProtocols.Action = { type: MJProtocols.ActionType.Gang, list: gangList };
                actions.push(action);
            }
        }


        /** 查找被动杠  点杠 */
        public searchPassivePeng(card: number, actions: MJProtocols.Action[]) {
            // 过水不碰
            let gangList = CardUtils.searchJiaGangCardsList(this.holdCards, this.cutGroups);
            if (gangList.length) {
                let action: MJProtocols.Action = { type: MJProtocols.ActionType.Peng, list: gangList };
                actions.push(action);
            }
        }


        /** 查找被动杠  点杠 */
        public searchPassiveChi(card: number, nextSeat: MJProtocols.Seat, actions: MJProtocols.Action[]) {
            if (this.rule.rulesMaps[MJProtocols.RuleType.XiaJiaChi] && this.seat === nextSeat) {
                let gangList = CardUtils.searchJiaGangCardsList(this.holdCards, this.cutGroups);
                if (gangList.length) {
                    let action: MJProtocols.Action = { type: MJProtocols.ActionType.Gang, list: gangList };
                    actions.push(action);
                }
            }
        }

        /** 查找被动杠  点杠 */
        public searchPassiveHu(card: number, huFlag: MJProtocols.HuFlag, type: MJProtocols.ActionType, actions: MJProtocols.Action[]) {
            // TODO  过水不胡
            if (type === MJProtocols.ActionType.DianPaoHu) this.searchDianPaoHu(card, huFlag, actions);
            else if (type === MJProtocols.ActionType.QiangGangHu) this.searchQiangGangHu(card, huFlag, actions);
        }

        public searchPassiveGuo(actions: MJProtocols.Action[]) {
            actions.push({ type: MJProtocols.ActionType.Guo }); // 可以过
        }

        /** 查找被动胡  点炮*/
        private searchDianPaoHu(card: number, huFlag: MJProtocols.HuFlag, actions: MJProtocols.Action[]) {
            let holdCardsCountMap = CardUtils.getCardCountMap(this.holdCards);
            // TODO  过水不胡
            if (CardUtils.checkHu(holdCardsCountMap)) {
                let action: MJProtocols.Action = { type: MJProtocols.ActionType.Hu };
                actions.push(action);
            }
        }

        /** 查找主动胡  抢杠*/
        private searchQiangGangHu(card: number, huFlag: MJProtocols.HuFlag, actions: MJProtocols.Action[]) {
            if (this.rule.rulesMaps[MJProtocols.RuleType.QiangGangHu]) {
                let holdCardsCountMap = CardUtils.getCardCountMap(this.holdCards);
                if (CardUtils.checkHu(holdCardsCountMap)) {
                    let action: MJProtocols.Action = { type: MJProtocols.ActionType.Hu };
                    actions.push(action);
                }
            }
        }

    }
}
export = HandModule;