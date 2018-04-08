export enum Color {
    /** 未知 (扣着的牌) (缺: 还未定缺) */
    Unknow,
    /** 箭 = 1(中,发,白) */
    Jian,
    /** 风 = 2(东,南,西,北) */
    Feng,
    /** 万 = 3(1~9) */
    Wan,
    /** 条 = 4(1~9) */
    Tiao,
    /** 饼 = 5(1~9) */
    Bing,
    /** 花 = 6(梅,兰,竹,菊) */
    Hua,
    /** 季 = 7(春,夏,秋,冬) */
    Ji
}

export enum Direction {
    None,
    ZiJia,
    DuiJia,
    ShangJia,
    XiaJia
}

export enum Rogue {
    None,
    Rogue
}

export type Card = {
    direction?: Direction,
    rogue?: Rogue,  //  赖子
    value: number, // 点数(1-9)
    color: Color, // 花
    index: number // 牌(1-4)
}

export enum ActionType {
    None, // 空
    Mo,    // 摸牌
    Guo,  // 过

    Chi,
    Peng,
    Gang,
    AnGang,
    DianGang,
    JiaGang,
    Ting,
    Hu,
    ZiMoHu,
    DianPaoHu,
    QiangGangHu,

    Da,


    ZhuaPai = 50  // 发牌阶段发牌
}

export type Action = {
    type: ActionType,
    list?: number[][]
}

export enum GroupType {
    Dan,
    DuiZi,
    ShunZi,
    Ke,
    Gang,

    QuanPai = 1000,
    ShouPai,
}

export type Group = {
    cards: number[],
    type: GroupType
}

export type Seat = number;

export type Hand = {
    /**座位 */
    seat: Seat,
    /** 手牌 */
    handCards: number[],
    /** 附录 */
    fuluCards: Group[],
    /** 当前牌 */
    turnCard: number
}

export type Hu = {
    seat: Seat,
    dian: Seat,
    cards: number[]
}


export type Game = {
    /** 座位数量 */
    seatNum: 2 | 3 | 4,
    /** 手牌数量 */
    handCardNum: number,
    /** 初始牌 */
    cards: number[],
    /** 庄家 */
    zhuang: Seat
}


export enum Process {
    None,
    Piao,
    DingZhuang,
    DingQue,
    FaPai,
    XingPai,
    JieSuan
}


export type HuFlag = {
    isGangShangHua: boolean,
    isGangShangPao: boolean,
    isQiangGang: boolean,
    isDianGangHua: boolean,
    isDiHu: boolean,
    isTianHu: boolean,
    isHaiDiLaoYue: boolean,
    isZimo: boolean,
    isBaoTing: boolean
}


export enum RuleType {
    XiaJiaChi,
    QiangGangHu
}