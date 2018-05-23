"use strict";
var _ = require("lodash");
var MJProtocols = require("../protocols/mahjong");
var CardUtils = require("../utils/card_utils");
var HandModule;
(function (HandModule) {
    var Hand = /** @class */ (function () {
        function Hand(rule, seat) {
            this.rule = rule;
            this.queColor = MJProtocols.Color.Unknow;
            this.cutGroups = [];
            this.holdCards = [];
            this.turnCard = -1;
            this.huFlag = null;
            this.seat = seat;
        }
        Hand.prototype.faPai = function (cards) {
            this.holdCards = cards;
        };
        /** 定缺 */
        Hand.prototype.dingQue = function (color) {
            this.queColor = color;
        };
        Hand.prototype.daPai = function (card) {
            CardUtils.removeCards(this.holdCards, [card]);
        };
        /** 设定当前牌 */
        Hand.prototype.setTurnCard = function (card) {
            this.turnCard = card;
        };
        Hand.prototype.setHuFlag = function (huFlag) {
            this.huFlag = huFlag;
        };
        Hand.prototype.setGuoShuiBuHu = function (huFlag) {
            // TODO
        };
        Hand.prototype.setGuoShuiBuPeng = function (card) {
            // TODO
        };
        Hand.prototype.getHuFlag = function (huFlag) {
            return _.cloneDeep(huFlag);
        };
        /** 是否还能继续打牌 */
        Hand.prototype.isPlay = function () {
            return true;
        };
        /** 查找主动杠  暗杠 加杠*/
        Hand.prototype.searchInitiativeGang = function (actions) {
            var anGangList = CardUtils.searchAnGangCardsList(this.holdCards);
            var jiaGangList = CardUtils.searchJiaGangCardsList(this.holdCards, this.cutGroups);
            var gangList = anGangList.concat(jiaGangList);
            if (gangList.length) {
                var action = { type: MJProtocols.ActionType.Gang, list: gangList };
                actions.push(action);
            }
        };
        /** 查找主动胡  自摸*/
        Hand.prototype.searchInitiativeHu = function (huFlag, actions) {
            var holdCardsCountMap = CardUtils.getCardCountMap(this.holdCards);
            if (CardUtils.checkHu(holdCardsCountMap)) {
                var action = { type: MJProtocols.ActionType.Hu };
                actions.push(action);
            }
        };
        /** 查找主动打*/
        Hand.prototype.searchInitiativeDa = function (actions) {
            var daCards = CardUtils.searchDaCards(this.holdCards, this.queColor);
            var action = { type: MJProtocols.ActionType.Da, list: [daCards] };
            actions.push(action);
        };
        /** 查找被动杠  点杠 */
        Hand.prototype.searchPassiveGang = function (card, actions) {
            var gangList = CardUtils.searchJiaGangCardsList(this.holdCards, this.cutGroups);
            if (gangList.length) {
                var action = { type: MJProtocols.ActionType.Gang, list: gangList };
                actions.push(action);
            }
        };
        /** 查找被动杠  点杠 */
        Hand.prototype.searchPassivePeng = function (card, actions) {
            // 过水不碰
            var gangList = CardUtils.searchJiaGangCardsList(this.holdCards, this.cutGroups);
            if (gangList.length) {
                var action = { type: MJProtocols.ActionType.Peng, list: gangList };
                actions.push(action);
            }
        };
        /** 查找被动杠  点杠 */
        Hand.prototype.searchPassiveChi = function (card, nextSeat, actions) {
            if (this.rule.rulesMaps[MJProtocols.RuleType.XiaJiaChi] && this.seat === nextSeat) {
                var gangList = CardUtils.searchJiaGangCardsList(this.holdCards, this.cutGroups);
                if (gangList.length) {
                    var action = { type: MJProtocols.ActionType.Gang, list: gangList };
                    actions.push(action);
                }
            }
        };
        /** 查找被动杠  点杠 */
        Hand.prototype.searchPassiveHu = function (card, huFlag, type, actions) {
            // TODO  过水不胡
            if (type === MJProtocols.ActionType.DianPaoHu)
                this.searchDianPaoHu(card, huFlag, actions);
            else if (type === MJProtocols.ActionType.QiangGangHu)
                this.searchQiangGangHu(card, huFlag, actions);
        };
        Hand.prototype.searchPassiveGuo = function (actions) {
            actions.push({ type: MJProtocols.ActionType.Guo }); // 可以过
        };
        /** 查找被动胡  点炮*/
        Hand.prototype.searchDianPaoHu = function (card, huFlag, actions) {
            var holdCardsCountMap = CardUtils.getCardCountMap(this.holdCards);
            // TODO  过水不胡
            if (CardUtils.checkHu(holdCardsCountMap)) {
                var action = { type: MJProtocols.ActionType.Hu };
                actions.push(action);
            }
        };
        /** 查找主动胡  抢杠*/
        Hand.prototype.searchQiangGangHu = function (card, huFlag, actions) {
            if (this.rule.rulesMaps[MJProtocols.RuleType.QiangGangHu]) {
                var holdCardsCountMap = CardUtils.getCardCountMap(this.holdCards);
                if (CardUtils.checkHu(holdCardsCountMap)) {
                    var action = { type: MJProtocols.ActionType.Hu };
                    actions.push(action);
                }
            }
        };
        return Hand;
    }());
    HandModule.Hand = Hand;
})(HandModule || (HandModule = {}));
module.exports = HandModule;
