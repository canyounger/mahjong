"use strict";
var HandModule = require("./hand");
var _ = require("lodash");
var events = require("events");
var MJProtocols = require("../protocols/mahjong");
var GameModule;
(function (GameModule) {
    var AnswerLevel;
    (function (AnswerLevel) {
        AnswerLevel[AnswerLevel["L0"] = 0] = "L0";
        AnswerLevel[AnswerLevel["L1"] = 1] = "L1";
        AnswerLevel[AnswerLevel["L2"] = 2] = "L2";
        AnswerLevel[AnswerLevel["L3"] = 3] = "L3";
        AnswerLevel[AnswerLevel["L4"] = 4] = "L4"; // 胡
    })(AnswerLevel || (AnswerLevel = {}));
    function getAnswerLevel(action) {
        var actionMap2Levels = {};
        // L1
        actionMap2Levels[MJProtocols.ActionType.Guo] = AnswerLevel.L1;
        // L2
        actionMap2Levels[MJProtocols.ActionType.Chi] = AnswerLevel.L2;
        // L3
        actionMap2Levels[MJProtocols.ActionType.Peng] = AnswerLevel.L3;
        actionMap2Levels[MJProtocols.ActionType.Gang] = AnswerLevel.L3;
        // L4
        actionMap2Levels[MJProtocols.ActionType.Hu] = AnswerLevel.L4;
        return actionMap2Levels[action.type];
    }
    var Game = /** @class */ (function () {
        function Game(rule) {
            this.rule = rule;
            this.dealer = -1;
            this.hands = [];
            this.flag = {
                isPassive: true,
                currentAction: null,
                currentCards: [],
                currentCardNum: 0,
                currentSeat: -1,
                nextSeat: -1,
                currentProcess: MJProtocols.Process.None,
                nextProcess: MJProtocols.Process.None,
                currentCard: 0,
                questionSeatNum: 0,
                questionMaxLevel: AnswerLevel.L0,
                questionMaxLevelNum: 0,
                answerActions: [],
                questionActions: [],
                answerLevels: [],
                arbitralActions: []
            };
            for (var seat = 0; seat < this.rule.seatNum; seat++) {
                var hand = new HandModule.Hand(rule, seat);
                this.hands.push(hand);
                this.flag.answerActions.push(null);
                this.flag.questionActions.push(null);
                this.flag.answerLevels.push(AnswerLevel.L0);
                this.flag.arbitralActions.push(null);
            }
            this.event = new events.EventEmitter();
        }
        Game.prototype.init = function (actionCallBack, answerCallBack) {
            this.event.on('action', actionCallBack);
            this.event.on('answer', answerCallBack);
        };
        /** 检查动作回答是否合法 */
        Game.prototype.resetQuestionSeatActions = function () {
            for (var seat = 0; seat < this.rule.seatNum; seat++) {
                this.flag.questionActions[seat] = null;
            }
            this.flag.questionMaxLevel = AnswerLevel.L0;
            this.flag.questionMaxLevelNum = 0;
            this.flag.questionSeatNum = 0;
        };
        Game.prototype.resetAnswerSeatActions = function () {
            for (var seat = 0; seat < this.rule.seatNum; seat++) {
                this.flag.answerActions[seat] = null;
                this.flag.answerLevels[seat] = AnswerLevel.L0;
                this.flag.arbitralActions[seat] = null;
            }
        };
        Game.prototype.checkAnswerLegal = function (seat, action) {
            if (this.flag.answerActions[seat])
                return new Error('duplicateAnswer');
            var questionActions = this.flag.questionActions[seat];
            if (questionActions === null)
                return new Error('noInQuestions');
            for (var i = 0; i < questionActions.length; i++) {
                var questionAction = questionActions[i];
                if (action.type !== questionAction.type)
                    continue;
                if (_.has(questionAction, 'groups')) {
                }
                this.flag.answerActions[seat] = action;
                this.flag.answerLevels[seat] = getAnswerLevel(action);
                return null;
            }
            return new Error('noInActions');
        };
        Game.prototype.xingPai = function () {
            this.flag.isPassive = !this.flag.isPassive;
            this.event.emit('answer', this.flag.questionActions);
        };
        Game.prototype.faPai = function () {
            if (this.dealer === -1)
                this.dealer = _.random(0, this.rule.seatNum - 1);
            this.flag.currentCards = _.cloneDeep(this.rule.allCards);
            for (var i = 0; i < this.rule.seatNum; i++) {
                var seat = (i + this.dealer) % this.rule.seatNum;
                var isDealer = i === this.dealer;
                var num = isDealer ? this.rule.handCardsNum + 1 : this.rule.handCardsNum;
                var handCards = this.flag.currentCards.splice(0, num - 1);
                if (isDealer)
                    this.hands[seat].setTurnCard(handCards[0]);
                var action = {
                    type: MJProtocols.ActionType.ZhuaPai,
                    list: [handCards]
                };
                this.flag.answerActions[seat] = action;
                this.hands[seat].faPai(handCards);
            }
            this.flag.nextSeat = this.dealer;
            this.flag.nextProcess = this.getNextProcess();
            this.event.emit('action', this.flag.answerActions);
        };
        /** 触发响应 */
        Game.prototype.onAnswer = function (seat, action) {
            var err = this.checkAnswerLegal(seat, action);
            console.log('on answer', err ? err.message : "", seat, JSON.stringify(action));
            if (err)
                return err;
            if (this.checkFinishAnswer()) {
                if (this.flag.isPassive) {
                }
                else {
                }
            }
            // 检查 是否切换 处理流
            // 检查 是否切换 动作玩家
        };
        /** 切换流程 */
        Game.prototype.changeTurnProcess = function (Process) {
            if (this.flag.currentProcess === Process)
                return;
            this.flag.currentProcess = Process;
            switch (this.flag.currentProcess) {
                case MJProtocols.Process.FaPai:
                    this.faPai();
                    break;
                case MJProtocols.Process.XingPai: {
                    this.changeTurnSeat(this.dealer);
                    this.searchInitiativeActions();
                    this.flag.isPassive = true;
                    this.xingPai();
                    break;
                }
            }
        };
        /** 继续当前流程 */
        Game.prototype.continueTurnProcess = function () {
            switch (this.flag.currentProcess) {
                case MJProtocols.Process.XingPai:
                    this.xingPai();
                    break;
            }
        };
        Game.prototype.changeTurnSeat = function (seat) {
            this.flag.currentSeat = seat;
            this.flag.currentCard = this.hands[seat].turnCard;
        };
        Game.prototype.getNextSeat = function (seat) {
            for (var i = 1; i < this.rule.seatNum; i++) {
                var nextSeat = (seat + i) % this.rule.seatNum; // 从下家问起
                if (this.hands[nextSeat].isPlay())
                    continue;
                return nextSeat;
            }
            return 0;
        };
        Game.prototype.getPassiveSeats = function (seat) {
            var actionSeats = [];
            for (var i = 1; i < this.rule.seatNum; i++) {
                var nextSeat = (seat + i) % this.rule.seatNum; // 从下家问起
                if (!this.hands[nextSeat].isPlay())
                    continue;
                actionSeats.push(nextSeat);
            }
            return actionSeats;
        };
        Game.prototype.getHuFlag = function () {
            var huFlag = {
                isGangShangHua: false,
                isGangShangPao: false,
                isQiangGang: false,
                isDianGangHua: false,
                isDiHu: false,
                isTianHu: false,
                isHaiDiLaoYue: false,
                isZimo: false,
                isBaoTing: false
            };
            if (this.flag.currentCards.length === 0)
                huFlag.isHaiDiLaoYue = true;
            return huFlag;
        };
        Game.prototype.checkFinishXingPai = function () {
            return 0;
        };
        Game.prototype.checkFinishAnswer = function () {
            var answerNum = 0;
            var maxAnswerLevel = AnswerLevel.L0;
            var maxAnswerLevelNum = 0;
            for (var seat = 0; seat < this.flag.answerActions.length; seat++) {
                var answerAction = this.flag.answerActions[seat];
                if (!answerAction)
                    continue;
                answerNum++;
                var level = this.flag.answerLevels[seat];
                if (level === this.flag.questionMaxLevel)
                    maxAnswerLevelNum++;
                maxAnswerLevel = maxAnswerLevel > level ? maxAnswerLevel : level;
            }
            if (answerNum === this.flag.questionSeatNum || maxAnswerLevelNum === this.flag.questionMaxLevelNum) {
                for (var seat = 0; seat < this.flag.answerActions.length; seat++) {
                    var answerAction = this.flag.answerActions[seat];
                    if (!answerAction)
                        continue;
                    var level = this.flag.answerLevels[seat];
                    if (level === maxAnswerLevel) {
                        this.flag.arbitralActions[seat] = answerAction;
                    }
                }
                return true;
            }
            return false;
        };
        Game.prototype.searchQuestionLevel = function () {
            this.flag.questionMaxLevel = AnswerLevel.L0;
            this.flag.questionSeatNum = 0;
            for (var i in this.flag.questionActions) {
                var maxLevel = AnswerLevel.L0;
                if (!this.flag.questionActions[i])
                    continue;
                this.flag.questionSeatNum++;
                for (var j in this.flag.questionActions[i]) {
                    var level = getAnswerLevel(this.flag.questionActions[i][j]);
                    maxLevel = maxLevel > level ? maxLevel : level;
                }
                this.flag.answerLevels[i] = maxLevel;
                this.flag.questionMaxLevel = this.flag.questionMaxLevel > maxLevel ? this.flag.questionMaxLevel : maxLevel;
            }
            for (var k in this.flag.answerLevels) {
                if (this.flag.answerLevels[k] === this.flag.questionMaxLevel) {
                    this.flag.questionMaxLevelNum++;
                }
            }
        };
        /** 检查主动玩家的所以动作 */
        Game.prototype.searchInitiativeActions = function () {
            var actionSeats = [this.flag.currentSeat];
            this.resetQuestionSeatActions();
            var huFlag = this.getHuFlag();
            for (var i in actionSeats) {
                var seat = actionSeats[i];
                var hand = this.hands[seat];
                var actions = [];
                // 杠
                var gangAction = hand.searchInitiativeGang();
                if (gangAction !== null)
                    actions.push(gangAction);
                // 胡
                var huAction = hand.searchInitiativeHu(hand.getHuFlag(huFlag));
                if (huAction !== null)
                    actions.push(huAction);
                // 打
                var daAction = hand.searchInitiativeDa();
                actions.push(daAction);
                this.flag.questionActions[seat] = actions;
            }
            this.searchQuestionLevel();
            this.resetAnswerSeatActions();
        };
        /** 检查被动玩家的所以动作 */
        Game.prototype.searchPassiveActions = function () {
            var actionSeats = this.getPassiveSeats(this.flag.currentSeat);
            var nextSeat = this.getNextSeat(this.flag.currentSeat);
            var huFlag = this.getHuFlag();
            var action = this.flag.currentAction;
            var flag = false;
            this.resetQuestionSeatActions();
            for (var i in actionSeats) {
                var seat = actionSeats[i];
                var actions = [];
                var hand = this.hands[seat];
                if (action.type === MJProtocols.ActionType.Da) {
                    var card = action.list[0][0];
                    // 杠
                    var gangAction = hand.searchPassiveGang(card);
                    if (gangAction !== null)
                        actions.push(gangAction);
                    // 胡
                    var huAction = hand.searchPassiveHu(card, hand.getHuFlag(huFlag), MJProtocols.ActionType.DianPaoHu);
                    if (huAction !== null)
                        actions.push(huAction);
                    // 下家吃
                    if (this.rule.rulesMaps[MJProtocols.RuleType.XiaJiaChi] && seat === nextSeat) {
                        var chiAction = hand.searchPassiveChi(card);
                        if (chiAction !== null)
                            actions.push(chiAction);
                    }
                }
                else if (action.type === MJProtocols.ActionType.JiaGang) {
                    var card = action.list[0][0];
                    if (this.rule.rulesMaps[MJProtocols.RuleType.QiangGangHu]) {
                        var huAction = hand.searchPassiveHu(card, hand.getHuFlag(huFlag), MJProtocols.ActionType.QiangGangHu);
                        if (huAction !== null)
                            actions.push(huAction);
                    }
                }
                if (actions.length > 0) {
                    actions.push({ type: MJProtocols.ActionType.Guo }); // 可以过
                    this.flag.questionActions[seat] = actions;
                    flag = true;
                }
            }
            if (flag) {
                this.searchQuestionLevel();
                this.resetAnswerSeatActions();
            }
            return flag;
        };
        /** 处理主动玩家的动作 */
        Game.prototype.handleInitiativeAction = function () {
            var arbitralActions = _.cloneDeep(this.flag.arbitralActions);
            for (var i in this.flag.arbitralActions) {
                if (!this.flag.arbitralActions[i])
                    continue;
                var hand = this.hands[i];
                var action = this.flag.arbitralActions[i];
                if (action.type === MJProtocols.ActionType.Da) {
                    var card = action.list[0][0];
                    hand.daPai(card);
                    if (this.searchPassiveActions()) {
                        // TODO
                    }
                    else {
                    }
                }
                break;
            }
            this.event.emit('action', arbitralActions);
        };
        /** 处理被动玩家的动作 */
        Game.prototype.handlePassiveAction = function () {
        };
        /** 触发开始 */
        Game.prototype.getNextProcess = function () {
            var index = _.indexOf(this.rule.Processs, this.flag.currentProcess);
            if (index !== -1 && (index + 1) < this.rule.Processs.length) {
                return this.rule.Processs[index + 1];
            }
            return this.flag.currentProcess;
        };
        Game.prototype.onStart = function () {
            if (this.flag.currentProcess !== MJProtocols.Process.None)
                return new Error('hasStart');
            this.changeTurnProcess(this.rule.Processs[0]);
            return null;
        };
        Game.prototype.onNext = function () {
            if (this.flag.nextProcess !== MJProtocols.Process.None) {
                this.changeTurnProcess(this.flag.nextProcess);
            }
            else {
                this.continueTurnProcess();
            }
            return null;
        };
        return Game;
    }());
    GameModule.Game = Game;
})(GameModule || (GameModule = {}));
module.exports = GameModule;
