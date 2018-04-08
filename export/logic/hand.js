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
        Hand.prototype.getHuFlag = function (huFlag) {
            return _.cloneDeep(huFlag);
        };
        /** 是否还能继续打牌 */
        Hand.prototype.isPlay = function () {
            return true;
        };
        /** 查找主动杠  暗杠 加杠*/
        Hand.prototype.searchInitiativeGang = function () {
            var anGangList = CardUtils.searchAnGangCardsList(this.holdCards);
            var jiaGangList = CardUtils.searchJiaGangCardsList(this.holdCards, this.cutGroups);
            var gangList = anGangList.concat(jiaGangList);
            if (gangList.length) {
                var action = { type: MJProtocols.ActionType.Gang, list: gangList };
                return action;
            }
            return null;
        };
        /** 查找主动胡  自摸*/
        Hand.prototype.searchInitiativeHu = function (huFlag) {
            var holdCardsCountMap = CardUtils.getCardCountMap(this.holdCards);
            if (CardUtils.checkHu(holdCardsCountMap)) {
                var action = { type: MJProtocols.ActionType.Hu };
                return action;
            }
            return null;
        };
        /** 查找主动打*/
        Hand.prototype.searchInitiativeDa = function () {
            var daCards = CardUtils.searchDaCards(this.holdCards, this.queColor);
            var action = { type: MJProtocols.ActionType.Da, list: [daCards] };
            return action;
        };
        /** 查找被动杠  点杠 */
        Hand.prototype.searchPassiveGang = function (card) {
            var gangList = CardUtils.searchJiaGangCardsList(this.holdCards, this.cutGroups);
            if (gangList.length) {
                var action = { type: MJProtocols.ActionType.Gang, list: gangList };
                return action;
            }
            return null;
        };
        /** 查找被动杠  点杠 */
        Hand.prototype.searchPassiveChi = function (card) {
            var gangList = CardUtils.searchJiaGangCardsList(this.holdCards, this.cutGroups);
            if (gangList.length) {
                var action = { type: MJProtocols.ActionType.Gang, list: gangList };
                return action;
            }
            return null;
        };
        /** 查找被动杠  点杠 */
        Hand.prototype.searchPassiveHu = function (card, huFlag, type) {
            if (type === MJProtocols.ActionType.DianPaoHu)
                this.searchDianPao(card, huFlag);
            else if (type === MJProtocols.ActionType.QiangGangHu)
                this.searchQiangGang(card, huFlag);
            return null;
        };
        /** 查找被动胡  点炮*/
        Hand.prototype.searchDianPao = function (card, huFlag) {
            var holdCardsCountMap = CardUtils.getCardCountMap(this.holdCards);
            if (CardUtils.checkHu(holdCardsCountMap)) {
                var action = { type: MJProtocols.ActionType.Hu };
                return action;
            }
            return null;
        };
        /** 查找主动胡  点炮*/
        Hand.prototype.searchQiangGang = function (card, huFlag) {
            var holdCardsCountMap = CardUtils.getCardCountMap(this.holdCards);
            if (CardUtils.checkHu(holdCardsCountMap)) {
                var action = { type: MJProtocols.ActionType.Hu };
                return action;
            }
            return null;
        };
        return Hand;
    }());
    HandModule.Hand = Hand;
})(HandModule || (HandModule = {}));
module.exports = HandModule;
