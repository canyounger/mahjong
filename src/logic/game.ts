import * as HandModule from './hand';
import * as RuleModule from './rule';
import * as _ from 'lodash';
import * as events from 'events';
import * as MJProtocols from '../protocols/mahjong';
module GameModule {
    type GameFlag = {
        isPassive: boolean,
        currentAction: MJProtocols.Action
        /** 当前的牌 */
        currentCards: number[]
        /** 当前的剩余牌 */
        currentCardNum: number,
        /** 当前行动位置 */
        currentSeat: MJProtocols.Seat,
        /** 下个行动位置 */
        nextSeat: MJProtocols.Seat,
        /** 当前牌 */
        currentCard: number,
        /** 当前流程 */
        currentProcess: MJProtocols.Process,
        /** 下个流程 */
        nextProcess: MJProtocols.Process,
        /** 问题座位对应的数量 */
        questionSeatNum: number
        /** 问题座位对应的问题 */
        questionActions: MJProtocols.Action[][],
        /** 问题座位对应的响应 */
        answerActions: MJProtocols.Action[],
        /** 所有问题对应的最高回答级别 */
        questionMaxLevel: AnswerLevel,
        /** 所有问题对应的最高回答级别的数量有几个 */
        questionMaxLevelNum: number
        /**  问题座位对应的回答级别*/
        answerLevels: AnswerLevel[],
        /** 仲裁后的最后可以动作的位置  */
        arbitralActions: MJProtocols.Action[]
    }

    enum AnswerLevel {
        L0,
        L1,   // 过  或超时处理
        L2,  // 吃
        L3, // 碰杠
        L4  // 胡
    }
    function getAnswerLevel(action: MJProtocols.Action): AnswerLevel {
        let actionMap2Levels = {};
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

    type Flag = {};
    export class Game {
        /**总共位置数量 */
        dealer: MJProtocols.Seat
        /** 手牌 */
        hands: HandModule.Hand[]
        /** 牌池 */
        cards: number[]
        /** 牌局标志 */
        flag: GameFlag
        /** 规则  */
        rule: RuleModule.Rule
        /** 事件 */
        event: events.EventEmitter
        constructor(rule: RuleModule.Rule) {
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
            }
            for (let seat = 0; seat < this.rule.seatNum; seat++) {
                let hand = new HandModule.Hand(rule, seat);
                this.hands.push(hand);
                this.flag.answerActions.push(null);
                this.flag.questionActions.push(null);
                this.flag.answerLevels.push(AnswerLevel.L0);
                this.flag.arbitralActions.push(null);
            }
            this.event = new events.EventEmitter();
        }

        init(actionCallBack, answerCallBack) {
            this.event.on('action', actionCallBack);
            this.event.on('answer', answerCallBack);
        }



        /** 检查动作回答是否合法 */
        private resetQuestionSeatActions() {
            for (let seat = 0; seat < this.rule.seatNum; seat++) {
                this.flag.questionActions[seat] = null;
            }
            this.flag.questionMaxLevel = AnswerLevel.L0;
            this.flag.questionMaxLevelNum = 0;
            this.flag.questionSeatNum = 0;
        }

        private resetAnswerSeatActions() {
            for (let seat = 0; seat < this.rule.seatNum; seat++) {
                this.flag.answerActions[seat] = null;
                this.flag.answerLevels[seat] = AnswerLevel.L0;
                this.flag.arbitralActions[seat] = null;
            }
        }

        private checkAnswerLegal(seat: MJProtocols.Seat, action: MJProtocols.Action): Error {
            if (this.flag.answerActions[seat]) return new Error('duplicateAnswer');
            let questionActions = this.flag.questionActions[seat];
            if (questionActions === null) return new Error('noInQuestions');
            for (let i = 0; i < questionActions.length; i++) {
                let questionAction = questionActions[i];
                if (action.type !== questionAction.type) continue;
                if (_.has(questionAction, 'groups')) {

                }
                this.flag.answerActions[seat] = action;
                this.flag.answerLevels[seat] = getAnswerLevel(action);
                return null;
            }
            return new Error('noInActions');
        }

        protected xingPai() {
            this.flag.isPassive = !this.flag.isPassive;
            this.event.emit('answer', this.flag.questionActions);
        }

        protected faPai() {
            if (this.dealer === -1) this.dealer = _.random(0, this.rule.seatNum - 1) as MJProtocols.Seat;
            this.flag.currentCards = _.cloneDeep(this.rule.allCards);
            for (let i = 0; i < this.rule.seatNum; i++) {
                let seat = (i + this.dealer) % this.rule.seatNum;
                let isDealer = i === this.dealer;
                let num = isDealer ? this.rule.handCardsNum + 1 : this.rule.handCardsNum;
                let handCards = this.flag.currentCards.splice(0, num - 1);
                if (isDealer) this.hands[seat].setTurnCard(handCards[0]);
                let action: MJProtocols.Action = {
                    type: MJProtocols.ActionType.ZhuaPai,
                    list: [handCards]
                };
                this.flag.answerActions[seat] = action;
                this.hands[seat].faPai(handCards);
            }
            this.flag.nextSeat = this.dealer;
            this.flag.nextProcess = this.getNextProcess();
            this.event.emit('action', this.flag.answerActions);
        }

        /** 触发响应 */
        public onAnswer(seat: MJProtocols.Seat, action: MJProtocols.Action) {
            let err = this.checkAnswerLegal(seat, action);
            console.log('on answer', err ? err.message : "", seat, JSON.stringify(action));
            if (err) return err;
            if (this.checkFinishAnswer()) {
                if (this.flag.isPassive) {

                } else {

                }
            }
            // 检查 是否切换 处理流
            // 检查 是否切换 动作玩家
        }

        /** 切换流程 */
        private changeTurnProcess(Process: MJProtocols.Process) {
            if (this.flag.currentProcess === Process) return;
            this.flag.currentProcess = Process;
            switch (this.flag.currentProcess) {
                case MJProtocols.Process.FaPai: this.faPai(); break;
                case MJProtocols.Process.XingPai: {
                    this.changeTurnSeat(this.dealer);
                    this.searchInitiativeActions();
                    this.flag.isPassive = true;
                    this.xingPai(); break;
                }
            }
        }

        /** 继续当前流程 */
        private continueTurnProcess() {
            switch (this.flag.currentProcess) {
                case MJProtocols.Process.XingPai: {
                    if (this.flag.nextSeat !== -1) {
                        this.changeTurnSeat(this.flag.nextSeat);
                    } else {

                    }
                }; break;
            }
        }

        private changeTurnSeat(seat: MJProtocols.Seat) {
            this.flag.currentSeat = seat;
            this.flag.currentCard = this.hands[seat].turnCard;
        }

        private getNextSeat(seat: MJProtocols.Seat) {
            for (let i = 1; i < this.rule.seatNum; i++) {
                let nextSeat = (seat + i) % this.rule.seatNum;  // 从下家问起
                if (this.hands[nextSeat].isPlay()) continue;
                return nextSeat;
            }
            return 0;
        }

        private getPassiveSeats(seat: number): number[] {
            let actionSeats = [];
            for (let i = 1; i < this.rule.seatNum; i++) {
                let nextSeat = (seat + i) % this.rule.seatNum;  // 从下家问起
                if (!this.hands[nextSeat].isPlay()) continue;
                actionSeats.push(nextSeat);
            }
            return actionSeats;
        }

        private getHuFlag(): MJProtocols.HuFlag {
            let huFlag = {
                isGangShangHua: false,
                isGangShangPao: false,
                isQiangGang: false,
                isDianGangHua: false,
                isDiHu: false,
                isTianHu: false,
                isHaiDiLaoYue: false,
                isZimo: false,
                isBaoTing: false
            }
            if (this.flag.currentCards.length === 0) huFlag.isHaiDiLaoYue = true;
            return huFlag;
        }

        private checkFinishXingPai(): -1 | 0 | 1 {
            return 0;
        }

        private checkFinishAnswer(): boolean {
            let answerNum = 0;
            let maxAnswerLevel = AnswerLevel.L0;
            let maxAnswerLevelNum = 0;
            for (let seat = 0; seat < this.flag.answerActions.length; seat++) {
                let answerAction = this.flag.answerActions[seat];
                if (!answerAction) continue;
                answerNum++;
                let level = this.flag.answerLevels[seat];
                if (level === this.flag.questionMaxLevel) maxAnswerLevelNum++;
                maxAnswerLevel = maxAnswerLevel > level ? maxAnswerLevel : level;
            }
            if (answerNum === this.flag.questionSeatNum || maxAnswerLevelNum === this.flag.questionMaxLevelNum) { // 全回答完
                for (let seat = 0; seat < this.flag.answerActions.length; seat++) {
                    let answerAction = this.flag.answerActions[seat];
                    if (!answerAction) continue;
                    let level = this.flag.answerLevels[seat];
                    if (level === maxAnswerLevel) {
                        this.flag.arbitralActions[seat] = answerAction;
                    }
                }
                return true;
            }
            return false;
        }

        private searchQuestionLevel() {
            this.flag.questionMaxLevel = AnswerLevel.L0;
            this.flag.questionSeatNum = 0;
            for (let i in this.flag.questionActions) {
                let maxLevel = AnswerLevel.L0;
                if (!this.flag.questionActions[i]) continue;
                this.flag.questionSeatNum++;
                for (let j in this.flag.questionActions[i]) {
                    let level = getAnswerLevel(this.flag.questionActions[i][j]);
                    maxLevel = maxLevel > level ? maxLevel : level;
                }
                this.flag.answerLevels[i] = maxLevel;
                this.flag.questionMaxLevel = this.flag.questionMaxLevel > maxLevel ? this.flag.questionMaxLevel : maxLevel;
            }
            for (let k in this.flag.answerLevels) {
                if (this.flag.answerLevels[k] === this.flag.questionMaxLevel) {
                    this.flag.questionMaxLevelNum++;
                }
            }
        }

        /** 检查主动玩家的所以动作 */
        private searchInitiativeActions() {
            let actionSeats = [this.flag.currentSeat];
            this.resetQuestionSeatActions();
            let huFlag = this.getHuFlag();
            for (let i in actionSeats) {
                let seat = actionSeats[i];
                let hand = this.hands[seat];
                let actions: MJProtocols.Action[] = [];
                // 杠
                let gangAction = hand.searchInitiativeGang();
                if (gangAction !== null) actions.push(gangAction);
                // 胡
                let huAction = hand.searchInitiativeHu(hand.getHuFlag(huFlag));
                if (huAction !== null) actions.push(huAction);
                // 打
                let daAction = hand.searchInitiativeDa();
                actions.push(daAction);
                this.flag.questionActions[seat] = actions;
            }
            this.searchQuestionLevel();
            this.resetAnswerSeatActions();
        }
        /** 检查被动玩家的所以动作 */
        private searchPassiveActions(): boolean {
            let actionSeats = this.getPassiveSeats(this.flag.currentSeat);
            let nextSeat = this.getNextSeat(this.flag.currentSeat);
            let huFlag = this.getHuFlag();
            let action = this.flag.currentAction;
            let flag = false;
            this.resetQuestionSeatActions();
            for (let i in actionSeats) {
                let seat = actionSeats[i];
                let actions: MJProtocols.Action[] = [];
                let hand = this.hands[seat];
                if (action.type === MJProtocols.ActionType.Da) {  // 
                    let card = action.list[0][0];
                    // 杠
                    let gangAction = hand.searchPassiveGang(card);
                    if (gangAction !== null) actions.push(gangAction);
                    // 胡
                    let huAction = hand.searchPassiveHu(card, hand.getHuFlag(huFlag), MJProtocols.ActionType.DianPaoHu);
                    if (huAction !== null) actions.push(huAction);
                    // 下家吃
                    if (this.rule.rulesMaps[MJProtocols.RuleType.XiaJiaChi] && seat === nextSeat) {
                        let chiAction = hand.searchPassiveChi(card);
                        if (chiAction !== null) actions.push(chiAction);
                    }
                }
                else if (action.type === MJProtocols.ActionType.JiaGang) { // 抢杠处理
                    let card = action.list[0][0];
                    if (this.rule.rulesMaps[MJProtocols.RuleType.QiangGangHu]) {
                        let huAction = hand.searchPassiveHu(card, hand.getHuFlag(huFlag),
                            MJProtocols.ActionType.QiangGangHu);
                        if (huAction !== null) actions.push(huAction);
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
        }

        /** 处理主动玩家的动作 */
        private handleInitiativeAction() {
            let arbitralActions = _.cloneDeep(this.flag.arbitralActions);
            for (let i in this.flag.arbitralActions) {
                if (!this.flag.arbitralActions[i]) continue;
                let seat = parseInt(i);
                let hand = this.hands[i];
                let action = this.flag.arbitralActions[i];
                if (action.type === MJProtocols.ActionType.Da) {
                    let card = action.list[0][0];
                    hand.daPai(card);
                    if (this.searchPassiveActions()) {
                        // TODO
                    } else {
                        let nextSeat = this.getNextSeat(seat);
                        this.flag.nextSeat = nextSeat;
                    }
                }
                break;
            }
            this.event.emit('action', arbitralActions);
        }

        /** 处理被动玩家的动作 */
        private handlePassiveAction() {

        }
        /** 触发开始 */
        private getNextProcess() {
            let index = _.indexOf(this.rule.Processs, this.flag.currentProcess);
            if (index !== -1 && (index + 1) < this.rule.Processs.length) {
                return this.rule.Processs[index + 1];
            }
            return this.flag.currentProcess;
        }

        public onStart(): Error {
            if (this.flag.currentProcess !== MJProtocols.Process.None) return new Error('hasStart');
            this.changeTurnProcess(this.rule.Processs[0]);
            return null;
        }

        public onNext(): Error {
            if (this.flag.nextProcess !== MJProtocols.Process.None) {
                this.changeTurnProcess(this.flag.nextProcess);
            } else {
                this.continueTurnProcess();
            }
            return null;
        }
    }
}
export = GameModule;