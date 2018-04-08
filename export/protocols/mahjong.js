"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Color;
(function (Color) {
    /** 未知 (扣着的牌) (缺: 还未定缺) */
    Color[Color["Unknow"] = 0] = "Unknow";
    /** 箭 = 1(中,发,白) */
    Color[Color["Jian"] = 1] = "Jian";
    /** 风 = 2(东,南,西,北) */
    Color[Color["Feng"] = 2] = "Feng";
    /** 万 = 3(1~9) */
    Color[Color["Wan"] = 3] = "Wan";
    /** 条 = 4(1~9) */
    Color[Color["Tiao"] = 4] = "Tiao";
    /** 饼 = 5(1~9) */
    Color[Color["Bing"] = 5] = "Bing";
    /** 花 = 6(梅,兰,竹,菊) */
    Color[Color["Hua"] = 6] = "Hua";
    /** 季 = 7(春,夏,秋,冬) */
    Color[Color["Ji"] = 7] = "Ji";
})(Color = exports.Color || (exports.Color = {}));
var Direction;
(function (Direction) {
    Direction[Direction["None"] = 0] = "None";
    Direction[Direction["ZiJia"] = 1] = "ZiJia";
    Direction[Direction["DuiJia"] = 2] = "DuiJia";
    Direction[Direction["ShangJia"] = 3] = "ShangJia";
    Direction[Direction["XiaJia"] = 4] = "XiaJia";
})(Direction = exports.Direction || (exports.Direction = {}));
var Rogue;
(function (Rogue) {
    Rogue[Rogue["None"] = 0] = "None";
    Rogue[Rogue["Rogue"] = 1] = "Rogue";
})(Rogue = exports.Rogue || (exports.Rogue = {}));
var ActionType;
(function (ActionType) {
    ActionType[ActionType["None"] = 0] = "None";
    ActionType[ActionType["Mo"] = 1] = "Mo";
    ActionType[ActionType["Guo"] = 2] = "Guo";
    ActionType[ActionType["Chi"] = 3] = "Chi";
    ActionType[ActionType["Peng"] = 4] = "Peng";
    ActionType[ActionType["Gang"] = 5] = "Gang";
    ActionType[ActionType["AnGang"] = 6] = "AnGang";
    ActionType[ActionType["DianGang"] = 7] = "DianGang";
    ActionType[ActionType["JiaGang"] = 8] = "JiaGang";
    ActionType[ActionType["Ting"] = 9] = "Ting";
    ActionType[ActionType["Hu"] = 10] = "Hu";
    ActionType[ActionType["ZiMoHu"] = 11] = "ZiMoHu";
    ActionType[ActionType["DianPaoHu"] = 12] = "DianPaoHu";
    ActionType[ActionType["QiangGangHu"] = 13] = "QiangGangHu";
    ActionType[ActionType["Da"] = 14] = "Da";
    ActionType[ActionType["ZhuaPai"] = 50] = "ZhuaPai"; // 发牌阶段发牌
})(ActionType = exports.ActionType || (exports.ActionType = {}));
var GroupType;
(function (GroupType) {
    GroupType[GroupType["Dan"] = 0] = "Dan";
    GroupType[GroupType["DuiZi"] = 1] = "DuiZi";
    GroupType[GroupType["ShunZi"] = 2] = "ShunZi";
    GroupType[GroupType["Ke"] = 3] = "Ke";
    GroupType[GroupType["Gang"] = 4] = "Gang";
    GroupType[GroupType["QuanPai"] = 1000] = "QuanPai";
    GroupType[GroupType["ShouPai"] = 1001] = "ShouPai";
})(GroupType = exports.GroupType || (exports.GroupType = {}));
var Process;
(function (Process) {
    Process[Process["None"] = 0] = "None";
    Process[Process["Piao"] = 1] = "Piao";
    Process[Process["DingZhuang"] = 2] = "DingZhuang";
    Process[Process["DingQue"] = 3] = "DingQue";
    Process[Process["FaPai"] = 4] = "FaPai";
    Process[Process["XingPai"] = 5] = "XingPai";
    Process[Process["JieSuan"] = 6] = "JieSuan";
})(Process = exports.Process || (exports.Process = {}));
var RuleType;
(function (RuleType) {
    RuleType[RuleType["XiaJiaChi"] = 0] = "XiaJiaChi";
    RuleType[RuleType["QiangGangHu"] = 1] = "QiangGangHu";
})(RuleType = exports.RuleType || (exports.RuleType = {}));
