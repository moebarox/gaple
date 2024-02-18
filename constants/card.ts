/**
 * First card that must be placed on the board
 * on the first turn of the round
 */
export const FIRST_TURN_CARD = '1|1'

/**
 * The cards that can't be placed on the board
 * on the first turn of the round
 */
export const FORBIDDEN_FIRST_TURN_CARDS = ['0|0', '6|6']

/**
 * Cards that if placed to finish the game
 * will cause the other player to receive a penalty
 */
export const ULTIMATE_LAST_CARD = ['0|0', '6|6']

/**
 * List of domino cards.
 * Has a total of 28 cards.
 */
export const DEFAULT_CARDS = [
  '0|0',
  '0|1',
  '0|2',
  '0|3',
  '0|4',
  '0|5',
  '0|6',
  '1|1',
  '1|2',
  '1|3',
  '1|4',
  '1|5',
  '1|6',
  '2|2',
  '2|3',
  '2|4',
  '2|5',
  '2|6',
  '3|3',
  '3|4',
  '3|5',
  '3|6',
  '4|4',
  '4|5',
  '4|6',
  '5|5',
  '5|6',
  '6|6',
]
