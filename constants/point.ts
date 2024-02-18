/**
 * Point transferred from the player
 * to every next player who has no card to pick
 */
export const SKIP_POINT = 1

/**
 * Point given to the player with the highest card remaining
 * when the game is over without any player finishing the game
 */
export const GAPLE_POINT = 2

/**
 * Point given to the player with the highest card remaining
 * when one of the players has finished the game
 */
export const POLDAN_POINT = 1

/**
 * Point given to every player if the last card is 0|0 or 6|6
 * when the game is over
 */
export const LAST_BALAK_POINT = 2

/**
 * The first player who got the treshold is the loser
 */
export const PENALTY_POINT_TRESHOLD = 7
