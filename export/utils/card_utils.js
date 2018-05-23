"use strict";
var MJProtocols = require("../protocols/mahjong");
var CardUtils;
(function (CardUtils) {
    function sortByAsc(a, b) {
        return a - b;
    }
    function removeCards(sourceCards, sourceChange) {
        for (var i = 0; i < sourceChange.length; i++) {
            var card = sourceChange[i];
            var index = sourceCards.indexOf(card);
            if (index !== -1)
                sourceCards.splice(index, 1);
        }
    }
    CardUtils.removeCards = removeCards;
    /** 获取牌的数字值 */
    function getCardNumber(card) {
        var value = card.color << 8 | card.index << 4 | card.value;
        return value;
    }
    CardUtils.getCardNumber = getCardNumber;
    /** 检查打牌列表 */
    function searchDaCards(holdCards, queColor) {
        var cards = [];
        for (var i = 0; i < holdCards.length; i++) {
            var card = holdCards[i];
            var color = (card & 0xF00) >> 8;
            if (queColor === color)
                continue;
            cards.push(card);
        }
        return cards;
    }
    CardUtils.searchDaCards = searchDaCards;
    /** 检查暗杠列表*/
    function searchAnGangCardsList(holdCards) {
        var cardsList = [];
        var searchs = {};
        for (var i = 0; i < holdCards.length; i++) {
            var card = holdCards[i];
            var value = card & 0xFF0;
            if (!searchs[value])
                searchs[value] = [];
            searchs[value].push(card);
        }
        for (var j in searchs) {
            if (searchs[j].length !== 4)
                continue;
            cardsList.push(searchs[j].sort(sortByAsc));
        }
        return cardsList;
    }
    CardUtils.searchAnGangCardsList = searchAnGangCardsList;
    /** 检查加杠列表*/
    function searchJiaGangCardsList(holdCards, cutGroups) {
        var cardsList = [];
        var searchs = {};
        for (var k = 0; k < cutGroups.length; k++) {
            var group = cutGroups[k];
            var card = group.cards[0];
            var value = card & 0xFF0;
            if (group.type === MJProtocols.GroupType.Ke) {
                if (!searchs[value])
                    searchs[value] = [];
                searchs[value] = searchs[value].concat(group.cards);
            }
        }
        for (var i = 0; i < holdCards.length; i++) {
            var card = holdCards[i];
            var value = card & 0xFF0;
            if (!searchs[value])
                continue;
            searchs[value].push(card);
        }
        for (var j in searchs) {
            if (searchs[j].length !== 4)
                continue;
            cardsList.push(searchs[j].sort(sortByAsc));
        }
        return cardsList;
    }
    CardUtils.searchJiaGangCardsList = searchJiaGangCardsList;
    function getCardCountMap(holdCards) {
        var countMap = {};
        for (var i in holdCards) {
            var card = holdCards[i] & 0xFF0; // 去掉索引
            if (!countMap[card])
                countMap[card] = [];
            countMap[card].push(holdCards[i]);
        }
        return countMap;
    }
    CardUtils.getCardCountMap = getCardCountMap;
    function checkSingle(holds, countMap) {
        var selected = -1;
        var c = 0;
        for (var i = 0; i < holds.length; ++i) {
            var pai = holds[i];
            c = countMap[pai];
            if (c != 0) {
                selected = pai;
                break;
            }
        }
        //如果没有找到剩余牌，则表示匹配成功了
        if (selected == -1)
            return true;
        //否则，进行匹配
        if (c == 3) {
            //直接作为一坎
            countMap[selected] = 0;
            var ret = checkSingle(holds, countMap);
            //立即恢复对数据的修改
            countMap[selected] = c;
            if (ret == true)
                return true;
        }
        else if (c == 4) {
            //直接作为一坎
            countMap[selected] = 1;
            var ret = checkSingle(holds, countMap);
            //立即恢复对数据的修改
            countMap[selected] = c;
            //如果作为一坎能够把牌匹配完，直接返回TRUE。
            if (ret == true)
                return true;
        }
        //按单牌处理
        return matchSingle(holds, countMap, selected);
    }
    function matchSingle(holds, countMap, selected) {
        //分开匹配 A-2,A-1,A
        var matched = true;
        // var v = selected - 1 % 9;  //1-9 -> 0-8
        var v = selected & 0x00F;
        // console.log(v)
        // console.log(getShow(selected), 'matchSingle', v);
        if (v < 3) {
            matched = false;
        }
        else {
            for (var i = 0; i < 3; ++i) {
                var t = (selected & 0xFF0) | ((selected & 0x00F) - 2 + i);
                var cc = countMap[t];
                if (cc == null) {
                    matched = false;
                    break;
                }
                if (cc == 0) {
                    matched = false;
                    break;
                }
            }
        }
        //匹配成功，扣除相应数值
        if (matched) {
            countMap[(selected & 0xFF0) | ((selected & 0x00F) - 2)]--;
            countMap[(selected & 0xFF0) | ((selected & 0x00F) - 1)]--;
            countMap[(selected & 0xFF0) | ((selected & 0x00F) - 0)]--;
            var ret = checkSingle(holds, countMap);
            countMap[(selected & 0xFF0) | ((selected & 0x00F) - 2)]++;
            countMap[(selected & 0xFF0) | ((selected & 0x00F) - 1)]++;
            countMap[(selected & 0xFF0) | ((selected & 0x00F) - 0)]++;
            if (ret == true)
                return true;
        }
        //分开匹配 A-1,A,A + 1
        matched = true;
        if (v < 2 || v > 8) {
            matched = false;
        }
        else {
            for (var i = 0; i < 3; ++i) {
                var t = (selected & 0xFF0) | ((selected & 0x00F) - 1 + i);
                var cc = countMap[t];
                if (cc == null) {
                    matched = false;
                    break;
                }
                if (cc == 0) {
                    matched = false;
                    break;
                }
            }
        }
        //匹配成功，扣除相应数值
        if (matched) {
            countMap[(selected & 0xFF0) | ((selected & 0x00F) - 1)]--;
            countMap[(selected & 0xFF0) | ((selected & 0x00F))]--;
            countMap[(selected & 0xFF0) | ((selected & 0x00F) + 1)]--;
            var ret = checkSingle(holds, countMap);
            countMap[(selected & 0xFF0) | ((selected & 0x00F) - 1)]++;
            countMap[(selected & 0xFF0) | ((selected & 0x00F))]++;
            countMap[(selected & 0xFF0) | ((selected & 0x00F) + 1)]++;
            if (ret == true)
                return true;
        }
        //分开匹配 A,A+1,A + 2
        matched = true;
        if (v > 7) {
            matched = false;
        }
        else {
            for (var i = 0; i < 3; ++i) {
                var t = (selected & 0xFF0) | ((selected & 0x00F) + i);
                var cc = countMap[t];
                if (cc == null) {
                    matched = false;
                    break;
                }
                if (cc == 0) {
                    matched = false;
                    break;
                }
            }
        }
        //匹配成功，扣除相应数值
        if (matched) {
            countMap[(selected & 0xFF0) | ((selected & 0x00F) + 0)]--;
            countMap[(selected & 0xFF0) | ((selected & 0x00F) + 1)]--;
            countMap[(selected & 0xFF0) | ((selected & 0x00F) + 2)]--;
            var ret = checkSingle(holds, countMap);
            countMap[(selected & 0xFF0) | ((selected & 0x00F) + 0)]++;
            countMap[(selected & 0xFF0) | ((selected & 0x00F) + 1)]++;
            countMap[(selected & 0xFF0) | ((selected & 0x00F) + 2)]++;
            if (ret == true)
                return true;
        }
        return false;
    }
    function checkHu(holdCardsCountMap) {
        var noIndxHolds = [];
        var countMap = {};
        for (var i_1 in holdCardsCountMap) {
            var value = parseInt(i_1);
            countMap[i_1] = holdCardsCountMap[i_1].length;
            for (var j = 0; j < holdCardsCountMap[i_1].length; j++) {
                noIndxHolds.push(value);
            }
        }
        for (var i in countMap) {
            var k = parseInt(i);
            var c = countMap[i];
            if (c < 2)
                continue;
            //如果当前牌大于等于２，则将它选为将牌
            countMap[k] -= 2;
            //逐个判定剩下的牌是否满足　３Ｎ规则,一个牌会有以下几种情况
            //1、0张，则不做任何处理
            //2、2张，则只可能是与其它牌形成匹配关系
            //3、3张，则可能是单张形成 A-2,A-1,A  A-1,A,A+1  A,A+1,A+2，也可能是直接成为一坎
            //4、4张，则只可能是一坎+单张
            var ret = checkSingle(noIndxHolds, countMap);
            countMap[k] += 2;
            if (ret)
                return true;
        }
        return false;
    }
    CardUtils.checkHu = checkHu;
})(CardUtils || (CardUtils = {}));
module.exports = CardUtils;
