export const MAX_PLAYERS = 4

export const DEFAULT_MATCH = {
  settings: {
    password: '',
    roomMaster: '',
  },
  players: [],
  state: {
    board: [],
    round: 0,
    turn: '',
    lastTurn: '',
    lastRoundCard: '',
  },
}

export enum TURN_STATE {
  pickCard = 'PICK_CARD',
  selectPosition = 'SELECT_POSITION',
}

export enum BOARD_POSITION {
  head = 'HEAD',
  tail = 'TAIL',
}
