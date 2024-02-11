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
