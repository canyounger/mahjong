"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var RuleModule = require("../rule");
var _ = require("lodash");
var MJProtocols = require("../../protocols/mahjong");
var CardUtils = require("../../utils/card_utils");
var DaZhongRuleModule;
(function (DaZhongRuleModule) {
    var cardMaps = [
        { 'color': MJProtocols.Color.Bing, 'values': [1, 2, 3, 4, 5, 6, 7, 8, 9], 'num': 4 },
        { 'color': MJProtocols.Color.Wan, 'values': [1, 2, 3, 4, 5, 6, 7, 8, 9], 'num': 4 },
        { 'color': MJProtocols.Color.Tiao, 'values': [1, 2, 3, 4, 5, 6, 7, 8, 9], 'num': 4 },
        { 'color': MJProtocols.Color.Jian, 'values': [1, 2, 3], 'num': 4 },
        { 'color': MJProtocols.Color.Feng, 'values': [1, 2, 3, 4], 'num': 4 } // 东,南,西,北
    ];
    var DaZhongRule = /** @class */ (function (_super) {
        __extends(DaZhongRule, _super);
        function DaZhongRule() {
            var _this = _super.call(this) || this;
            _this.name = '大众规则';
            _this.seatNum = 4;
            _this.handCardsNum = 16;
            _this.Processs = [
                MJProtocols.Process.FaPai,
                MJProtocols.Process.XingPai,
                MJProtocols.Process.JieSuan
            ];
            _this.allCards = [];
            for (var i in cardMaps) {
                for (var j in cardMaps[i].values) {
                    for (var index = 1; index <= cardMaps[i].num; index++) {
                        var card = { color: cardMaps[i].color, value: cardMaps[i].values[j], index: index };
                        _this.allCards.push(CardUtils.getCardNumber(card));
                    }
                }
            }
            _this.allCards = _.shuffle(_this.allCards);
            _this.allRules = [
                MJProtocols.RuleType.XiaJiaChi // 下家吃
            ];
            _this.rulesMaps = {};
            for (var i in _this.allRules) {
                _this.rulesMaps[_this.allRules[i]] = true;
            }
            return _this;
        }
        return DaZhongRule;
    }(RuleModule.Rule));
    DaZhongRuleModule.DaZhongRule = DaZhongRule;
})(DaZhongRuleModule || (DaZhongRuleModule = {}));
module.exports = DaZhongRuleModule;
