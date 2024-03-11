/**
 * Maximum number of double cards for a player
 */
export const DOUBLE_CARD_TRESHOLD = 4

/**
 * Maximum number of players in the game
 */
export const MAX_PLAYERS = 4

/**
 * Minimum password character length
 */
export const MIN_PASSWORD_LENGTH = 4

/**
 * Match expire time in milliseconds (1 week)
 */
export const MATCH_EXPIRE_TIME = 1000 * 60 * 60 * 24 * 7

/**
 * Default values for the match.
 * Struct based on the Firestore document.
 */
export const DEFAULT_MATCH: TMatch = {
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
    firstTurnCard: '',
    rt: '',
  },
  expireAt: 0,
}

/**
 * Turn states
 *
 * pickCard - Player can pick a card from hand
 *
 * selectPosition - Player can select position when the selected card can be placed on either head or tail
 */
export enum TURN_STATE {
  pickCard,
  selectPosition,
}

/**
 * Board position
 *
 * head - Head of the board
 *
 * tail - Tail of the board
 */
export enum BOARD_POSITION {
  head,
  tail,
}
